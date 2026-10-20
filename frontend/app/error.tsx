"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="stack">
      <h1>Something went wrong</h1>
      <p className="muted">This page could not be loaded. Please try again.</p>

      <div className="filter-row">
        <button type="button" className="button primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="button">
          Back to home
        </Link>
      </div>
    </main>
  );
}
