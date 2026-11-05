import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoNotice } from "@/components/public/DemoNotice";
import { OutageStatusBoard } from "@/components/public/OutageStatusBoard";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = {
  title: "Outage Status",
  description: "See active and scheduled power outages by zone, area and date (demonstration data).",
  openGraph: { title: "Outage Status | PowerGrid BD", description: "Active and scheduled outages by zone, area and date.", type: "website" },
};

export default function OutageStatusPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary">Outage status</h1>
        <p className="mt-3 text-muted-foreground">
          Current and upcoming outages across the network. Use the filters to find your zone or area.
        </p>
      </header>
      <DemoNotice />
      {/* useSearchParams (filters) needs a Suspense boundary */}
      <Suspense fallback={<TableSkeleton />}>
        <OutageStatusBoard />
      </Suspense>
    </div>
  );
}
