import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaDetail } from "@/components/admin/InfrastructureDetails";
import { DetailSkeleton } from "@/components/shared/DetailList";

export const metadata: Metadata = { title: "Area details" };

// The data is loaded in the browser with the logged-in admin's session, so Next.js cannot
// pre-render it for the instant-navigation check. Opt out of that dev-only check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <AreaDetail />
    </Suspense>
  );
}
