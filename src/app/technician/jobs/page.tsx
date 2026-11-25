import type { Metadata } from "next";
import { Suspense } from "react";
import { AssignedJobs } from "@/components/technician/AssignedJobs";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "Assigned Jobs" };

// Data is loaded in the browser with the logged-in technician's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AssignedJobs />
    </Suspense>
  );
}
