import type { Metadata } from "next";
import { Suspense } from "react";
import { OutageDetail } from "@/components/admin/OutageDetail";
import { DetailSkeleton } from "@/components/shared/DetailList";

export const metadata: Metadata = { title: "Outage details" };

// Data is loaded in the browser with the logged-in admin's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <OutageDetail />
    </Suspense>
  );
}
