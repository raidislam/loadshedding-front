import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  FilePlus,
  History,
  Layers,
  Network,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description: "Outage reporting, load shedding schedules, technician dispatch, notifications and network management.",
  openGraph: { title: "Services | PowerGrid BD", description: "What the power management system offers customers, technicians and administrators.", type: "website" },
};

type Audience = "Customers" | "Technicians" | "Administrators" | "Everyone";

// Each audience gets its own accent colour, used on the chips and cards
const TINTS: Record<Audience, { gradient: string; chip: string; dot: string }> = {
  Customers: { gradient: "from-sky-500 to-cyan-400", chip: "border-sky-400/30 bg-sky-400/10 text-sky-300", dot: "bg-sky-400" },
  Technicians: { gradient: "from-amber-500 to-orange-400", chip: "border-amber-400/30 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  Administrators: { gradient: "from-indigo-500 to-violet-400", chip: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300", dot: "bg-indigo-400" },
  Everyone: { gradient: "from-emerald-500 to-teal-400", chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
};

const services: { icon: typeof Bell; title: string; for: Audience; points: string[] }[] = [
  { icon: CalendarClock, title: "Load shedding schedules", for: "Customers", points: ["Upcoming planned outages for your area", "Start time and expected restoration time", "Reason for each outage"] },
  { icon: FilePlus, title: "Outage reporting", for: "Customers", points: ["Report no power, voltage problems or damaged lines", "Attach a photo of the problem", "Track your report from submission to restoration"] },
  { icon: Wrench, title: "Repair management", for: "Technicians", points: ["See assigned jobs with priority and location", "Accept, start and complete repairs", "Add repair notes and upload evidence"] },
  { icon: Network, title: "Network management", for: "Administrators", points: ["Manage zones, substations, feeders and areas", "Schedule outages with a step-by-step form", "Assign technicians to customer reports"] },
  { icon: Bell, title: "Notifications", for: "Customers", points: ["Announcements for scheduled outages", "Alerts for unexpected outages", "Technician assignment and restoration updates"] },
  { icon: History, title: "Reports and history", for: "Everyone", points: ["Charts of monthly and zone-wise outages", "Completed job history for technicians", "Outage history for customers"] },
];

const audiences = (Object.keys(TINTS) as Audience[]).map((a) => ({
  name: a,
  count: services.filter((s) => s.for === a).length,
}));

export default function ServicesPage() {
  return (
    <div className="relative overflow-hidden bg-[#020617] text-slate-100">
      {/* Aurora background */}
      <div className="hero-grid-bg hero-grid-mask pointer-events-none absolute inset-0 opacity-60" />
      <div className="about-aurora pointer-events-none absolute -top-40 left-1/2 h-144 w-240 -translate-x-1/2 rounded-full bg-[conic-gradient(from_90deg,#6366f1,#0ea5e9,#f59e0b,#6366f1)] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] -right-40 size-112 rounded-full bg-electric/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -left-40 size-112 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-20 px-4 pt-32 pb-20 md:pt-40">
        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-sky-300 backdrop-blur">
            <Layers className="size-3.5" />
            Our services
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl">
            Everything the grid needs,{" "}
            <span className="bg-linear-to-r from-sky-300 via-cyan-200 to-amber-200 bg-clip-text text-transparent">
              in one place.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Each feature is designed for one of three roles. Log in with a demo account to try them.
          </p>

          {/* Audience legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {audiences.map((a) => (
              <span
                key={a.name}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur ${TINTS[a.name].chip}`}
              >
                <span className={`size-1.5 rounded-full ${TINTS[a.name].dot}`} />
                {a.name}
                <span className="rounded-full bg-white/10 px-1.5 text-[10px] text-white/80">{a.count}</span>
              </span>
            ))}
          </div>
        </header>

        {/* Service cards */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const tint = TINTS[s.for];
            return (
              <div
                key={s.title}
                className="group rounded-3xl bg-linear-to-br from-white/15 via-white/5 to-white/10 p-px transition duration-300 hover:-translate-y-1.5 hover:from-sky-400/60 hover:to-indigo-500/60"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#050d24] p-6">
                  <div className={`pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-linear-to-br ${tint.gradient} opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-30`} />
                  <span className="pointer-events-none absolute top-5 right-6 font-mono text-5xl font-bold text-white/5">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className={`relative flex size-12 items-center justify-center rounded-2xl bg-linear-to-br ${tint.gradient} text-white shadow-lg`}>
                    <s.icon className="size-6" />
                  </span>
                  <h2 className="relative mt-5 text-lg font-bold text-white">{s.title}</h2>
                  <span className={`relative mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tint.chip}`}>
                    <span className={`size-1.5 rounded-full ${tint.dot}`} />
                    For {s.for.toLowerCase()}
                  </span>

                  <ul className="relative mt-5 space-y-2.5 border-t border-white/10 pt-5 text-sm text-slate-400">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-sky-400/20 bg-linear-to-r from-electric/90 to-indigo-700 p-8 text-white shadow-2xl shadow-electric/30 md:p-12">
          <div className="hero-grid-bg pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-2xl font-bold md:text-3xl">Ready to explore?</p>
              <p className="mt-2 text-white/80">Check live demo outages or log in as any role.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/outage-status"
                className="inline-flex h-12 items-center rounded-full px-6 text-sm font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/10"
              >
                View outage status
              </Link>
              <Link
                href="/login"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90"
              >
                Try a demo account
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
