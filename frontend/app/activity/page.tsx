"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ActivityLog } from "@/types/api";

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

function filterActivity(items: ActivityLog[], text: string) {
  if (!text) {
    return items;
  }

  const lower = text.toLowerCase();
  return items.filter(
    (item) =>
      (item.action || "").toLowerCase().includes(lower) ||
      (item.info || "").toLowerCase().includes(lower),
  );
}

export default function ActivityPage() {
  const [allActivity, setAllActivity] = useState<ActivityLog[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/activity")
      .then((response) => response.json())
      .then((data: ActivityLog[]) => {
        setAllActivity(data || []);
      })
      .catch(() => {
        setAllActivity([]);
      });
  }, []);

  const visibleActivity = useMemo(() => filterActivity(allActivity, query), [allActivity, query]);

  return (
    <main className="stack">
      <nav>
        <Link href="/" className="button">
          Back
        </Link>
      </nav>

      <section className="card" style={{ padding: "1rem" }}>
        <h1 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Activity Feed</h1>

        <input
          className="input"
          placeholder="Search activity"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </section>

      <section className="card" style={{ padding: "1rem" }}>
        <small style={{ color: "var(--muted)" }}>
          Total: {allActivity.length} | Visible: {visibleActivity.length}
        </small>
      </section>

      <section className="card" style={{ padding: "1rem" }}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "0.7rem" }}>
          {visibleActivity.map((item) => (
            <li
              key={item.id}
              style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.6rem" }}
            >
              <div style={{ fontWeight: 600 }}>{item.action || "(no action)"}</div>
              <div>{item.info || "(no info)"}</div>
              <small style={{ color: "var(--muted)" }}>{formatTime(item.when)}</small>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
