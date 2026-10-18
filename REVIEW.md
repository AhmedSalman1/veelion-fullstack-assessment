# Code Review — VeeLion Full-Stack Assessment

## Backend

### Bugs

- **PATCH /tasks/:id lets the client overwrite any field, including `id`**
  - **What is wrong:** `patchTask` checks `title` and `completed`, then passes the whole `req.body` to `updateTask`.
  - **Why it matters:** A single request can rename a task's id (the task becomes unreachable under its old URL), fake timestamps.
  - **How to improve it:** Run the body through `validateUpdateTask` in `taskValidator.js`. It rejects unknown fields and returns a clean object with only `title`/`completed`.

- **A malformed data file is treated as empty and then overwritten**
  - **What is wrong:** `readJsonArray` returns `[]` when the parsed JSON is not an array. The next create then writes `[newTask]` over whatever was there.
  - **Why it matters:** One bad manual edit or a partial write turns into permanent data loss with no error anywhere.
  - **How to improve it:** Throw error when the content isn't an array.

- **Activity ids can conflict**
  - **What is wrong:** `createNewActivity` uses `String(Date.now())` as the id.
  - **Why it matters:** Two entries in the same millisecond get the same id. The frontend uses `id` as the React key, so duplicates cause rendering glitches, and the ids can't be used to address a single entry.
  - **How to improve it:** Reuse `createId()` from `utils/id.js` like the tasks module does.

- **A failed write can corrupt task data**
  - **What is wrong:** Each mutation does read → modify → `writeFile` with `await` in between. May Race Conditions happen. `writeFile` also truncates the file before writing.
  - **Why it matters:** Tasks created at the same moment quietly disappear. If the process dies during a write, the file can be corrupted.
  - **How to improve it:** Write a temporary file, then `rename` it over the original.

- **Data paths depend on where the process was started**
  - **What is wrong:** Both services build paths from `process.cwd()`. Running `node backend/src/server.js` from the repo root looks for `./data` at the root, which doesn't exist.
  - **Why it matters:** It works with `npm start` but breaks under a process manager, Docker `WORKDIR`.
  - **How to improve it:** Resolve from the source location `__dirname` or read a `DATA_DIR` env var.

### Performance

- **Activity module uses synchronous file I/O**
  - **What is wrong:** `existsSync`, `readFileSync` and `writeFileSync` run on every request.
  - **Why it matters:** They block the event loop, so while the log is being read or written no other request gets served.
  - **How to improve it:** Switch to the async `jsonStore` helpers the tasks module already uses.

- **The activity log grows without limit and is always returned in full**
  - **What is wrong:** `GET /activity` sends the entire file, and nothing ever trims it.
  - **Why it matters:** Response size, and memory grow with usage. The frontend then filters all of it on the client.
  - **How to improve it:** Add pagination (`limit`/`offset`), sort newest first on the server.

- **Every mutation rewrites the task collection**
  - **What is wrong:** Even `GET /tasks/:id` reads and parses all of `tasks.json`.
  - **Why it matters:** Fine at 3 tasks, wasteful at thousands, Write latency increases with the JSON file's size.
  - **How to improve it:** Once writes go through a single store module, keep an in-memory copy that is loaded once and updated on write.

### Security

- **Mass assignment on PATCH** (see Bugs). Listed here too because it lets any caller tamper with fields that should be server-owned.
  - **What is wrong:** Unvalidated keys from the request body are persisted.
  - **Why it matters:** Clients control `id`, `createdAt`, `updatedAt` and can inject arbitrary data into storage.
  - **How to improve it:** Whitelist fields via `validateUpdateTask`.

- **Activity log accepts anything from anyone**
  - **What is wrong:** `POST /activity` stores `action` and `info` with no type check, length limit or auth. An array body or numbers go straight into the file.
  - **Why it matters:** An activity log is supposed to be a trustworthy record. Right now any client can forge entries or fill the disk with large strings.
  - **How to improve it:** Validate both fields as optional strings with a max length. Longer term, write activity entries from the tasks service itself instead of exposing a public write endpoint.

- **No basic hardening**
  - **What is wrong:** There is no rate limiting, and string fields like `title` have no max length.
  - **Why it matters:** It's an easy target for spam writes, and every request tells the world it's Express.
  - **How to improve it:** Add `express-rate-limit` on write routes if this is ever exposed beyond localhost.

### Maintainability

- **Validation lives in three places with three different rules**
  - **What is wrong:** The controller validates, the service validates again, and `taskValidator.js` has a third (unused) version. Create allows a 1-character title; PATCH rejects it with "Title is too short".
  - **Why it matters:** Any rule change has to be made in several places, and they've already drifted apart.
  - **How to improve it:** Make `taskValidator.js` the single source. Controller calls it, service trusts its input. Decide one title rule and document it.

- **The two modules are built in completely different ways**
  - **What is wrong:** Tasks has async handlers, `asyncHandler`, `jsonStore`, `HttpError` and `{ data }` responses. Activity has its own sync file code, no `asyncHandler`, and returns raw arrays.
  - **Why it matters:** New contributors have no clear pattern to follow, and fixes to one module (e.g. atomic writes) don't reach the other.
  - **How to improve it:** Bring activity onto the same structure: shared store, async service, wrapped routes. Keep the raw response shape for now since the frontend depends on it.

- **No tests, no linting, no config module**
  - **What is wrong:** `package.json` has no test or lint script, and paths/ports are scattered constants.
  - **Why it matters:** "Already in production" code with no tests makes every refactor a guess.
  - **How to improve it:** Add a few supertest cases for each endpoint before refactoring, plus ESLint and a small `config.js`.

### Code quality

- **Naming in the activity module**
  - **What is wrong:** `aSvc`, `c`, `x`, `get_activity` and more, in snake_case next to camelCase everywhere else.
  - **Why it matters:** You have to read the body of each function to know what a variable holds.
  - **How to improve it:** Use descriptive, consistent service and handler names.

- **Copy-pasted functions**
  - **What is wrong:** `loadDataA` and `loadDataB` are identical.
  - **Why it matters:** Pure noise, and a fix in one will be missed in the other.
  - **How to improve it:** Delete both and use `readJsonArray`.

- **Inconsistent error responses**
  - **What is wrong:** The tasks controller builds error JSON by hand with messages like "bad body type", while the service throws `HttpError`. It also mutates `req.body` in place.
  - **Why it matters:** Clients get differently worded errors for the same problem, and the error handler is bypassed.
  - **How to improve it:** Throw `HttpError` everywhere, and return new objects instead of mutating the request.

## Frontend

### Bugs

- **Default backend URL points to the wrong port**
  - **What is wrong:** `lib/constants.ts` falls back to `http://localhost:4000`, and the endpoints doc says the same, but the backend listens on 3000.
  - **Why it matters:** Without `.env.local` every proxy call fails and the app shows only errors.
  - **How to improve it:** Default to 3000 and fix the doc.

- **Activity page crashes when the API returns an error**
  - **What is wrong:** The fetch in `app/activity/page.tsx:49` never checks `response.ok`. On a 500 the body is `error`, so it gets stored as the list and `forcedList.map` throws.
  - **Why it matters:** Backend down = blank white page with a runtime error instead of a message.
  - **How to improve it:** Check `response.ok`, keep an `error` state, and only store the body when it's an array.

- **A failed toggle hides the whole task list**
  - **What is wrong:** `updateTaskStatus` writes to the same `error` state as loading, and `TaskDashboard` renders the list only when `!error`.
  - **Why it matters:** One failed PATCH replaces all tasks with an error box and a Retry button that refetches everything.
  - **How to improve it:** Separate `loadError` from `mutationError`. Show mutation errors inline or as a small banner above the list.

- **Proxy routes turn every backend error into a 500**
  - **What is wrong:** All route handlers catch and return status 500, so a backend 404 or 400 reaches the browser as 500. The PATCH route also returns 500 when the request body isn't valid JSON.
  - **Why it matters:** The client can't tell "task not found" from "server broken", and the status codes lie.
  - **How to improve it:** Have `backendApi` throw an error that carries the backend status, and pass it through. Wrap `request.json()` so bad input gets a 400.

- **Error parsing in `requestJson` reports the wrong message**
  - **What is wrong:** In `useTasks.ts` the `throw` inside `try` is caught by its own `catch`. If the error body isn't JSON, the user sees Unexpected token instead of the status fallback.
  - **Why it matters:** Confusing error text and logic that's hard to follow.
  - **How to improve it:** Parse the body in a `try` that only returns the message, then throw once outside it, like `parseError` in `backendApi.ts` already does.

- **`updatingTaskId` only tracks one task**
  - **What is wrong:** Toggle task A, then B before A finishes: A's `finally` clears the id while B is still saving.
  - **Why it matters:** B's button re-enables mid-request, so it can be double-submitted.
  - **How to improve it:** Track a `Set` of pending ids, or disable all toggles while one is in flight.

### Performance

- **Activity page re-renders the whole list every 1.4 seconds**
  - **What is wrong:** An interval bumps `tick`, which re-runs the filter twice and then clones every item into `forcedList`, forever, even when nothing changed.
  - **Why it matters:** Constant CPU work and full list re-renders for no reason. It also drains battery on mobile.
  - **How to improve it:** Remove `tick`, `forcedList` and the interval. If live updates are wanted, only update state when data actually changes.

- **The same filter runs twice**
  - **What is wrong:** `applyFilterA` and `applyFilterB` do the same thing and are chained.
  - **Why it matters:** Double the work on every keystroke and tick.
  - **How to improve it:** One filter function, computed with `useMemo` from `allActivity` and `query`.

### Security

- **Backend URL uses the `NEXT_PUBLIC_` prefix**
  - **What is wrong:** `NEXT_PUBLIC_BACKEND_API_URL` is only needed in server route handlers, but the prefix makes Next inline it into the client bundle.
  - **Why it matters:** It exposes the internal backend address, and the whole point of the proxy is to keep it hidden.
  - **How to improve it:** Rename to `BACKEND_API_URL` and read it only in server code.

- **Task id goes into the backend URL unencoded, and raw errors are echoed**
  - **What is wrong:** `updateTaskInBackend` builds `/tasks/${taskId}` directly. An id like `../activity` makes the proxy call a different backend route.
  - **Why it matters:** The proxy can be steered to endpoints it was never meant to reach, and internal details leak to users.
  - **How to improve it:** Use `encodeURIComponent(taskId)`, and return a generic message to the client while logging the real error on the server.

### Maintainability

- **Three different fetch implementations**
  - **What is wrong:** `useTasks` has `requestJson`, `backendApi` has `parseError`, and the activity page uses a bare `fetch`.
  - **Why it matters:** Error handling already behaves differently on each page.
  - **How to improve it:** One client-side helper in `lib/` used by every hook.

- **Activity page doesn't follow the tasks structure**
  - **What is wrong:** Tasks are split into a hook and small components. Activity is a single 130-line page with fetching, filtering and rendering mixed together.
  - **Why it matters:** Harder to test and to change, and the Reports page will need a pattern to copy.
  - **How to improve it:** Add `useActivity` and `ActivityList`/`ActivityItem` components mirroring the tasks module.

- **Inline styles everywhere**
  - **What is wrong:** Almost every element has a `style` object, with repeated padding and hard-coded hex values.
  - **Why it matters:** Visual changes mean hunting through every component, and the CSS variables in `globals.css`.
  - **How to improve it:** Move them into classes (or CSS modules) built on the existing variables.

### Code quality

- **Dead and duplicate code on the activity page**
  - **What is wrong:** `formatTimeA`/`formatTimeB` and `applyFilterA`/`applyFilterB` are identical, `stats.everySecondTick` is never used, and `useTasks` returns a `tasks` value nobody reads.
  - **Why it matters:** Readers waste time figuring out what the difference is. There isn't one.
  - **How to improve it:** Delete the duplicates and unused values.

- **Pointless try/catch and loose types**
  - **What is wrong:** Each `backendApi` function catches an error only to throw a new one with the same message, losing the stack. `error` and `updatingTaskId` use `""` as "no value". `let fallback` is never reassigned.
  - **Why it matters:** More code, worse debugging, and empty-string sentinels are easy to misuse.
  - **How to improve it:** Drop the wrappers, use `string | null`, and `const`.

### UX issues

- **Activity page has no loading, error or empty state**
  - **What is wrong:** While loading it shows "Total: 0". On error it shows the same. A search with no hits shows an empty card.
  - **Why it matters:** Users can't tell "loading", "broken" and "nothing here" apart.
  - **How to improve it:** Add explicit states for each, like the task dashboard does.

- **Each activity timestamp is shown twice, oldest entry first**
  - **What is wrong:** Both formatters render the same date under each item, and the list keeps file order.
  - **Why it matters:** Looks like a bug, and a feed is expected to show the newest event on top.
  - **How to improve it:** Render the time once (a relative format like "5 min ago" with the full date in `title`) and sort newest first.

- **Misleading empty message and empty home cards**
  - **What is wrong:** With zero tasks, the dashboard says "No tasks match this filter". The home page cards have a title and nothing else.
  - **Why it matters:** Small things, but they make the app feel unfinished.
  - **How to improve it:** Different text for "no tasks yet" vs "no matches", and a one-line description on each card.

- **Accessibility gaps**
  - **What is wrong:** The search input has only a placeholder, no label. There's no shared navigation, just a "Back" link on each page.
  - **Why it matters:** Screen readers announce an unlabeled field, and moving between pages always goes through home.
  - **How to improve it:** Add a visually hidden `<label>` or `aria-label`, and put a simple nav bar in `layout.tsx`.

### React best practices

- **Derived data kept in state and synced with effects**
  - **What is wrong:** `shownActivity` and `forcedList` are copies of `allActivity` kept in sync through `useEffect`.
  - **Why it matters:** Every change causes an extra render, and there are moments where the copies are out of sync.
  - **How to improve it:** Keep only `allActivity` and `query` in state, and compute the visible list with `useMemo` during render.

- **Fetch effects have no cleanup**
  - **What is wrong:** Neither the activity effect nor `fetchTasks` uses an `AbortController` or ignore flag.
  - **Why it matters:** In dev Strict Mode the request fires twice, and leaving the page mid-request still lets the response run `setState` after unmount. Out-of-order responses (e.g. Retry clicked twice) can overwrite fresh data with stale data.
  - **How to improve it:** Abort in the effect cleanup and ignore results after abort.

- **Client boundary set too high**
  - **What is wrong:** The whole activity page is `"use client"`, and helpers are redefined on every render inside it.
  - **Why it matters:** More JS shipped than needed, and the initial HTML is empty until the client fetch completes.
  - **How to improve it:** Make the page a server component that fetches the initial data, pass it to a small client component for search, and move pure helpers out of the component body.
