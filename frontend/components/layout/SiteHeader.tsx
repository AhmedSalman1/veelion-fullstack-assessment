import Link from "next/link";
import { BarChart3, History, ListChecks } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="wordmark">
          Vee<span>Lion</span>
        </Link>

        <nav className="nav" aria-label="Primary">
          <Link href="/tasks">
            <ListChecks size={16} aria-hidden="true" />
            Tasks
          </Link>
          <Link href="/activity">
            <History size={16} aria-hidden="true" />
            Activity
          </Link>
          <Link href="/reports">
            <BarChart3 size={16} aria-hidden="true" />
            Reports
          </Link>
        </nav>
      </div>
    </header>
  );
}
