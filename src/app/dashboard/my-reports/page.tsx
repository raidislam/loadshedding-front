import type { Metadata } from "next";
import { Suspense } from "react";
import { MyReports } from "@/components/customer/MyReports";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "My Reports" };

// Data is loaded in the browser with the logged-in user's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <MyReports />
    </Suspense>
  );
}
