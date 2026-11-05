"use client";

import { useEffect, useState } from "react";

// Runs an async mock-service function and tracks loading / error state.
// `loader` must be a stable function (defined outside the component, or wrapped in useCallback).
// Call reload() after changing data to fetch it again.
export function useLoad<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong.");
      });
    return () => {
      cancelled = true;
    };
  }, [loader, version]);

  return {
    data,
    error,
    loading: data === null && error === null,
    reload: () => setVersion((v) => v + 1),
  };
}
