"use client";

import Link from "next/link";
import { useTasksSummary } from "@/hooks/useTasksSummary";

const STATUS_ROWS = [
  ["todo", "To do"],
  ["in-progress", "In progress"],
  ["done", "Done"],
] as const;

export function ReportsDashboard() {
  const { summary, loading, error, reload } = useTasksSummary();

  return (
    <section className="stack">
      <header className="report-heading">
        <h1>Reports</h1>
        <p className="muted">Task totals, status breakdown and recorded activity.</p>
      </header>

      {loading ? (
        <div className="card muted" role="status">
          Loading reports...
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

      {summary ? (
        <>
          <div className="metrics">
            <div className="metric">
              <span className="metric-label">Total tasks</span>
              <span className="metric-value">{summary.total}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Activity entries</span>
              <span className="metric-value">{summary.recentActivityCount}</span>
            </div>
          </div>

          <section className="stack report-section" aria-labelledby="tasks-by-status">
            <div className="report-section-head">
              <h2 id="tasks-by-status">Tasks by status</h2>
              <span className="badge">{summary.total} total</span>
            </div>

            <div className="card">
              <ul className="ledger">
                {STATUS_ROWS.map(([status, label]) => {
                  const count = summary.byStatus[status];
                  const share = summary.total > 0 ? (count / summary.total) * 100 : 0;

                  return (
                    <li key={status} className="ledger-row">
                      <span className="ledger-label">{label}</span>
                      <span className="ledger-track" aria-hidden="true">
                        <span
                          className={`ledger-bar ledger-bar--${status}`}
                          style={{ width: `${share}%` }}
                        />
                      </span>
                      <span className={`badge badge--${status}`}>{count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {summary.total === 0 ? (
              <p className="muted">
                No tasks yet. <Link href="/tasks">Create one on the Tasks page</Link>.
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </section>
  );
}
