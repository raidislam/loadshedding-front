import type { Metadata } from "next";
import { Suspense } from "react";
import { FeedersManager } from "@/components/admin/FeedersManager";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "Feeders" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  // The list uses URL query parameters, so it needs a Suspense boundary
  return (
    <Suspense fallback={<TableSkeleton />}>
      <FeedersManager />
    </Suspense>
  );
}
