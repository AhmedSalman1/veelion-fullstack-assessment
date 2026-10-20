"use client";

import { useCallback, useEffect, useState } from "react";
import type { ErrorResponse, TasksSummary } from "@/types/api";

async function requestSummary(): Promise<TasksSummary> {
  const response = await fetch("/api/reports/tasks-summary");

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;

    try {
      const body = (await response.json()) as ErrorResponse;
      message = body.error?.message || message;
    } catch {
      // Keep the status-based message when the body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as TasksSummary;
}

export function useTasksSummary() {
  const [summary, setSummary] = useState<TasksSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Only replace the summary on success so a failed refresh keeps the last report.
      setSummary(await requestSummary());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the report right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { summary, loading, error, reload };
}
