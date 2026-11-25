import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersManager } from "@/components/admin/UsersManager";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "User Management" };

// Data is loaded in the browser with the logged-in user's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <UsersManager />
    </Suspense>
  );
}
