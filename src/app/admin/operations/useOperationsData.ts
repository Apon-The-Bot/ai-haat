"use client";

import { useEffect, useState } from "react";

export function useOperationsData<T>(query = "") {
  const [data, setData] = useState<T>();
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const response = await fetch(`/api/admin/operations${query}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Queue request failed");
        const result: T = await response.json();
        if (!controller.signal.aborted) {
          setData(result);
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }

    void refresh();
    return () => controller.abort();
  }, [query, revision]);

  return { data, error, refresh: () => setRevision((value) => value + 1) };
}
