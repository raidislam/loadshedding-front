import type { Metadata } from "next";
import { Suspense } from "react";
import { Radio } from "lucide-react";
import { DemoNotice } from "@/components/public/DemoNotice";
import { OutageStatusBoard } from "@/components/public/OutageStatusBoard";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export const metadata: Metadata = {
  title: "Outage Status",
  description: "See ongoing and scheduled power outages by zone, area, status and date.",
  openGraph: { title: "Outage Status | PowerGrid BD", description: "Active and scheduled outages by zone, area and date.", type: "website" },
};

// Server Component page. The board below fetches live data on the server;
// <Suspense> shows a skeleton while it loads (the page header appears immediately).
export default function OutageStatusPage({ searchParams }: PageProps<"/outage-status">) {
  return (
    <div className="relative overflow-hidden bg-[#020617] text-slate-100">
      {/* Aurora background */}
      <div className="hero-grid-bg hero-grid-mask pointer-events-none absolute inset-0 opacity-60" />
      <div className="about-aurora pointer-events-none absolute -top-40 left-1/2 h-144 w-240 -translate-x-1/2 rounded-full bg-[conic-gradient(from_0deg,#0ea5e9,#f43f5e,#6366f1,#0ea5e9)] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] -left-40 size-112 rounded-full bg-electric/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -right-40 size-112 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-10 px-4 pt-32 pb-20 md:pt-40">
        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-sky-300 backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
            </span>
            <Radio className="size-3.5" />
            Outage status
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl">
            Is the power out{" "}
            <span className="bg-linear-to-r from-sky-300 via-cyan-200 to-rose-300 bg-clip-text text-transparent">
              near you?
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Current and upcoming outages across the network. Use the filters to find your zone or
            area.
          </p>
        </header>

        {/* `dark` switches the shared table, filters and pagination to dark tokens */}
        <div className="dark space-y-6 text-foreground">
          <DemoNotice className="border-amber-400/30 bg-amber-400/10 text-amber-200" />
          <Suspense fallback={<TableSkeleton />}>
            <OutageStatusBoard searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
