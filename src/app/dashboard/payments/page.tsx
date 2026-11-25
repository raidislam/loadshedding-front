import type { Metadata } from "next";
import { Suspense } from "react";
import { MyPayments } from "@/components/customer/MyPayments";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = { title: "Payment History" };

// Data is loaded in the browser with the logged-in user's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <MyPayments />
    </Suspense>
  );
}
