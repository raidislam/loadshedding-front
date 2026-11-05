import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersManager } from "@/components/admin/UsersManager";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "User Management" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <UsersManager />
    </Suspense>
  );
}
