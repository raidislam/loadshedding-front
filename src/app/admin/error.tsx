"use client";

import { ErrorView } from "@/components/shared/ErrorView";

// An error here only replaces the page area, so the sidebar and header stay visible.
export default function SectionError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} retry={retry} homeHref="/admin" homeLabel="Back to admin overview" />;
}
