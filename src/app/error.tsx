"use client";

import { ErrorView } from "@/components/shared/ErrorView";

// Catches errors in the public pages and anything without a closer error.tsx.
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} retry={retry} homeHref="/" homeLabel="Go to home page" />;
}
