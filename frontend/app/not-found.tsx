import Link from "next/link";

export default function NotFound() {
  return (
    <main className="stack">
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist or may have moved.</p>

      <div className="filter-row">
        <Link href="/" className="button primary">
          Back to home
        </Link>
      </div>
    </main>
  );
}
