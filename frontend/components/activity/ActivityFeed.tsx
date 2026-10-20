"use client";

import { useMemo, useState } from "react";
import { useActivity } from "@/hooks/useActivity";
import type { ActivityLog } from "@/types/api";

function toTime(value?: string) {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatTime(value?: string) {
  const time = toTime(value);
  return time === 0 ? "Unknown time" : new Date(time).toLocaleString();
}

function matchesQuery(item: ActivityLog, term: string) {
  if (!term) {
    return true;
  }

  return (
    (item.action || "").toLowerCase().includes(term) ||
    (item.info || "").toLowerCase().includes(term)
  );
}

export function ActivityFeed() {
  const { logs, loading, error, reload } = useActivity();
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();

  const visibleLogs = useMemo(
    () =>
      logs
        .filter((item) => matchesQuery(item, term))
        .sort((first, second) => toTime(second.when) - toTime(first.when)),
    [logs, term],
  );

  return (
    <section className="stack">
      <h1>Activity Feed</h1>

      <div className="card activity-controls">
        <label className="meta" htmlFor="activity-search">
          Search activity
        </label>
        <input
          id="activity-search"
          className="input"
          type="search"
          placeholder="Filter by action or info"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="activity-counts">
          <small className="meta">
            Total: {logs.length} | Visible: {visibleLogs.length}
          </small>
          {query ? (
            <button type="button" className="button" onClick={() => setQuery("")}>
              Clear search
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="card muted" role="status">
          Loading activity...
        </div>
      ) : null}

      {error ? (
        <div className="alert" role="alert">
          <p>{error}</p>
          <button type="button" className="button" onClick={reload}>
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        visibleLogs.length === 0 ? (
          <p className="empty">
            {logs.length === 0 ? "No activity yet." : `No matches for “${query.trim()}”.`}
          </p>
        ) : (
          <ul className="stack activity-list" aria-label="Activity log">
            {visibleLogs.map((item) => (
              <li key={item.id} className="card activity-item">
                <div className="activity-head">
                  <span className="activity-action">{item.action || "(no action)"}</span>
                  <time className="meta" dateTime={item.when}>
                    {formatTime(item.when)}
                  </time>
                </div>
                <div>{item.info || "(no info)"}</div>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </section>
  );
}
