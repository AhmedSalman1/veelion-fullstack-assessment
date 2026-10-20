import Link from "next/link";
import { BarChart3, History, ListChecks } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      <header className="stack home-head">
        <h1>VeeLion Frontend Assessment</h1>
        <p className="muted">
          Task, activity and reporting views built against the provided backend.
        </p>
      </header>

      <section className="stack card-grid">
        <Link href="/tasks" className="card card-link">
          <h2>
            <ListChecks size={20} aria-hidden="true" />
            Task Dashboard
          </h2>
        </Link>

        <Link href="/activity" className="card card-link">
          <h2>
            <History size={20} aria-hidden="true" />
            Activity Feed
          </h2>
        </Link>

        <Link href="/reports" className="card card-link">
          <h2>
            <BarChart3 size={20} aria-hidden="true" />
            Reports
          </h2>
        </Link>
      </section>
    </main>
  );
}
