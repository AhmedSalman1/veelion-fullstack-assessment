import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="wordmark">
          Vee<span>Lion</span>
        </Link>

        <nav className="nav" aria-label="Primary">
          <Link href="/tasks">Tasks</Link>
          <Link href="/activity">Activity</Link>
          <Link href="/reports">Reports</Link>
        </nav>
      </div>
    </header>
  );
}
