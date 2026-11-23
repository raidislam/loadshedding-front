"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api";

// One QueryClient for the whole browser session (TanStack Query caches the API data).
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // data is "fresh" for 30 seconds
            refetchOnWindowFocus: false,
            // Don't retry errors like 400/403/404 - only network or server errors
            retry: (failureCount, error) =>
              !(error instanceof ApiError && error.status < 500) && failureCount < 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
