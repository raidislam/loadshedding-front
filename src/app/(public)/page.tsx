import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Factory,
  FilePlus,
  House,
  MapPinned,
  UtilityPole,
  Wrench,
  Zap,
} from "lucide-react";
import { DemoNotice } from "@/components/public/DemoNotice";
import { HeroEnergyBackground } from "@/components/public/HeroEnergyBackground";
import { PowerGridIllustration } from "@/components/public/PowerGridIllustration";
import { areas } from "@/mock-data/areas";
import { feeders } from "@/mock-data/feeders";
import { substations } from "@/mock-data/substations";
import { zones } from "@/mock-data/zones";

export const metadata: Metadata = {
  title: { absolute: "PowerGrid BD | Load Shedding & Power Management System" },
  description:
    "Check load shedding schedules, report power outages, and follow repairs until your electricity is restored.",
  openGraph: {
    title: "PowerGrid BD | Load Shedding & Power Management System",
    description:
      "Check load shedding schedules, report power outages, and follow repairs until your electricity is restored.",
    type: "website",
  },
};

const features = [
  { icon: CalendarClock, title: "Load shedding schedules", text: "See when planned power cuts will happen in your area, with start and restoration times." },
  { icon: FilePlus, title: "Report an outage", text: "Tell us when your power fails. Your report is tracked from the first minute." },
  { icon: Wrench, title: "Technician dispatch", text: "Admins assign repair technicians who update progress as they work." },
  { icon: Bell, title: "Instant notifications", text: "Get notified about planned cuts, repair updates and power restoration." },
  { icon: MapPinned, title: "Zone and area coverage", text: "Every area is linked to its feeder, substation and distribution zone." },
  { icon: ClipboardCheck, title: "Full repair history", text: "Past outages and repair summaries stay available for customers and staff." },
];

const steps = [
  { title: "Customer reports", text: "A customer reports a power failure with a few details." },
  { title: "Admin reviews", text: "The control room checks the report and assigns a technician." },
  { title: "Technician repairs", text: "The technician accepts the job, starts repair and posts updates." },
  { title: "Power restored", text: "The outage is closed and customers in the area are notified." },
];

const stats = [
  { label: "Distribution zones", value: zones.length, icon: MapPinned },
  { label: "Substations", value: substations.length, icon: Building2 },
  { label: "Feeders", value: feeders.length, icon: UtilityPole },
  { label: "Service areas", value: areas.length, icon: House },
];

const flow = [
  { icon: Factory, title: "Generation", text: "Power plants produce electricity for the national grid." },
  { icon: MapPinned, title: "Zone", text: "Each distribution zone manages a region of the network." },
  { icon: Building2, title: "Substation", text: "Voltage is stepped down and split onto feeders." },
  { icon: UtilityPole, title: "Feeder", text: "Feeder lines carry power through the streets." },
  { icon: House, title: "Your area", text: "Electricity reaches homes and businesses in your area." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-svh items-center overflow-hidden bg-[#020617] text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#0c2a6b_0%,transparent_60%),radial-gradient(ellipse_at_bottom_left,#1e1b4b_0%,transparent_55%)]" />
        <div className="hero-grid-bg hero-grid-mask pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute top-1/4 right-[10%] size-112 rounded-full bg-electric/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-amber-400/10 blur-3xl" />
        <HeroEnergyBackground />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-28 pb-24 md:grid-cols-[1fr_1.15fr] md:pt-32 md:pb-28">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Demo project · Bangladesh-inspired sample data
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Know when the power goes off,{" "}
              <span className="bg-linear-to-r from-sky-300 via-cyan-200 to-amber-200 bg-clip-text text-transparent">
                and when it comes back.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/75 md:text-lg">
              PowerGrid BD brings load shedding schedules, outage reports and repair progress into
              one simple system for customers, technicians and administrators.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/outage-status"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-electric px-5 text-sm font-semibold text-white shadow-lg shadow-electric/40 transition hover:brightness-110"
              >
                <Zap className="size-4" />
                Check outage status
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-white/25 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Try the demo
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-[10%] rounded-full bg-electric/20 blur-3xl" />
            <div className="hero-art-fade relative md:scale-110">
              <PowerGridIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the home page continues the dark electric theme */}
      <div className="relative overflow-x-clip bg-[#020617] text-slate-100">
        <div className="hero-grid-bg hero-grid-mask pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute top-[20%] -left-40 size-112 rounded-full bg-electric/15 blur-3xl" />
        <div className="pointer-events-none absolute top-[55%] -right-40 size-112 rounded-full bg-indigo-500/15 blur-3xl" />

        {/* Stats strip, overlapping the hero */}
        <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-[#0b1530]/80 p-3 shadow-2xl shadow-electric/10 backdrop-blur-xl md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl p-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-electric/15 text-sky-300 ring-1 ring-electric/30">
                  <s.icon className="size-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How power reaches you */}
        <section className="relative mx-auto max-w-6xl px-4 pt-24 pb-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">The power chain</p>
            <h2 className="mt-2 text-3xl font-bold text-white">From power plant to your home</h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-400">
              Every outage is traced along the same path electricity travels, so problems are found
              and fixed faster.
            </p>
          </div>
          <div className="relative mt-12">
            <div className="pg-line absolute top-7 right-[10%] left-[10%] hidden h-0.5 md:block" />
            <ol className="relative grid gap-8 md:grid-cols-5">
              {flow.map((f) => (
                <li key={f.title} className="flex flex-col items-center text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-electric to-indigo-600 text-white shadow-lg shadow-electric/40 ring-4 ring-[#020617]">
                    <f.icon className="size-6" />
                  </span>
                  <p className="mt-4 font-semibold text-white">{f.title}</p>
                  <p className="mt-1 max-w-56 text-sm text-slate-400">{f.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Features</p>
            <h2 className="mt-2 text-3xl font-bold text-white">What you can do</h2>
            <p className="mt-2 text-slate-400">Everything in one place, for everyone involved.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:bg-white/6 hover:shadow-xl hover:shadow-electric/20"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-electric/20 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                <span className="flex size-12 items-center justify-center rounded-xl bg-electric/15 text-sky-300 ring-1 ring-electric/30 transition-colors group-hover:bg-electric group-hover:text-white">
                  <f.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Outage workflow */}
        <section className="relative border-y border-white/10 bg-linear-to-b from-[#071431]/80 to-[#0b1d45]/60">
          <div className="relative mx-auto max-w-6xl px-4 py-20">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Workflow</p>
              <h2 className="mt-2 text-3xl font-bold text-white">How an outage is handled</h2>
            </div>
            <div className="relative mt-12">
              <div className="pg-line absolute top-10 right-[12%] left-[12%] hidden h-0.5 md:block" />
              <ol className="relative grid gap-5 md:grid-cols-4">
                {steps.map((s, i) => (
                  <li
                    key={s.title}
                    className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    <span
                      className={`flex size-10 items-center justify-center rounded-full text-sm font-bold text-white ring-4 ring-[#0b1d45] ${
                        i === steps.length - 1
                          ? "bg-emerald-500 shadow-lg shadow-emerald-500/40"
                          : "bg-electric shadow-lg shadow-electric/40"
                      }`}
                    >
                      {i === steps.length - 1 ? <Zap className="size-5" /> : i + 1}
                    </span>
                    <p className="mt-4 font-semibold text-white">{s.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-6xl space-y-6 px-4 py-20">
          <div className="relative overflow-hidden rounded-3xl border border-sky-400/20 bg-linear-to-r from-electric/90 to-indigo-700 p-8 text-white shadow-2xl shadow-electric/30 md:p-12">
            <div className="hero-grid-bg pointer-events-none absolute inset-0 opacity-50" />
            <Zap className="pointer-events-none absolute -right-6 -bottom-10 size-56 text-white/10" strokeWidth={1.2} />
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-2xl font-bold md:text-3xl">Want to see it in action?</p>
                <p className="mt-2 text-white/80">
                  Log in with one click as an admin, a customer or a technician.
                </p>
              </div>
              <Link
                href="/login"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90"
              >
                Open demo login
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
          <DemoNotice className="border-amber-400/30 bg-amber-400/10 text-amber-200" />
        </section>
      </div>
    </>
  );
}
