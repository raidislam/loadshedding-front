import type { Metadata } from "next";
import { Suspense } from "react";
import { AssignmentsManager } from "@/components/admin/AssignmentsManager";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "Repair Jobs" };

// Data is loaded in the browser with the logged-in admin's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AssignmentsManager />
    </Suspense>
  );
}
