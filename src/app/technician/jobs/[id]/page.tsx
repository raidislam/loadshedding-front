import type { Metadata } from "next";
import { Suspense } from "react";
import { JobDetail } from "@/components/technician/JobDetail";
import { DetailSkeleton } from "@/components/shared/DetailList";

export const metadata: Metadata = { title: "Job details" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <JobDetail />
    </Suspense>
  );
}
