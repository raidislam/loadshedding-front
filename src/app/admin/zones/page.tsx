import type { Metadata } from "next";
import { Suspense } from "react";
import { ZonesManager } from "@/components/admin/ZonesManager";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "Distribution Zones" };

// Data is loaded in the browser with the logged-in admin's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  // The list uses URL query parameters, so it needs a Suspense boundary
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ZonesManager />
    </Suspense>
  );
}
