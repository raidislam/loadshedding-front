import type { Metadata } from "next";
import { Suspense } from "react";
import { SubstationDetail } from "@/components/admin/InfrastructureDetails";
import { DetailSkeleton } from "@/components/shared/DetailList";

export const metadata: Metadata = { title: "Substation details" };

// The page content comes from browser storage (demo data), so Next.js cannot
// pre-render it for the instant-navigation check. Opt out of that dev-only check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <SubstationDetail />
    </Suspense>
  );
}
