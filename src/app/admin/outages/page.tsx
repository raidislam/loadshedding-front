import type { Metadata } from "next";
import { Suspense } from "react";
import { OutagesManager } from "@/components/admin/OutagesManager";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "Outage Management" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <OutagesManager />
    </Suspense>
  );
}
