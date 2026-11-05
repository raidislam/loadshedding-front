import type { Metadata } from "next";
import { Suspense } from "react";
import { JobHistory } from "@/components/technician/JobHistory";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "Job History" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <JobHistory />
    </Suspense>
  );
}
