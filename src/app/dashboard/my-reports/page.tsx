import type { Metadata } from "next";
import { Suspense } from "react";
import { MyReports } from "@/components/customer/MyReports";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "My Reports" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <MyReports />
    </Suspense>
  );
}
