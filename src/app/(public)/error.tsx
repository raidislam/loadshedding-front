"use client";

import { ErrorView } from "@/components/shared/ErrorView";

// An error on a public page only replaces the page area, so the navbar and footer stay.
export default function PublicError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} retry={retry} homeHref="/" homeLabel="Go to home page" />;
}
