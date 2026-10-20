"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActivityLog, ErrorResponse } from "@/types/api";

async function requestActivity(): Promise<ActivityLog[]> {
  const response = await fetch("/api/activity");

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

  // GET /api/activity returns a raw array, not { data }.
  const body = (await response.json()) as unknown;
  return Array.isArray(body) ? (body as ActivityLog[]) : [];
}

export function useActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setLogs(await requestActivity());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load activity right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { logs, loading, error, reload };
}
