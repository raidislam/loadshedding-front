import type { Metadata } from "next";
import { Suspense } from "react";
import { BillsManager } from "@/components/admin/BillsManager";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "Electricity Bills" };

// Data is loaded in the browser with the logged-in user's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <BillsManager />
    </Suspense>
  );
}
