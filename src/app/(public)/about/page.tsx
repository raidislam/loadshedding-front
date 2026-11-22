import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Eye,
  Gauge,
  Landmark,
  MapPinned,
  ShieldCheck,
  Sparkles,
  User,
  UtilityPole,
  House,
  Wrench,
  Zap,
} from "lucide-react";
import { DemoNotice } from "@/components/public/DemoNotice";

export const metadata: Metadata = {
  title: "About",
  description: "Learn what the Load Shedding & Power Management System does and how the electricity network is organised.",
  openGraph: { title: "About | PowerGrid BD", description: "How the system models the electricity network and outage handling.", type: "website" },
};

const levels = [
  { name: "Power Authority", text: "The organisation that owns and runs the network.", icon: Landmark },
  { name: "Distribution Zone", text: "A large region, for example Dhaka North.", icon: MapPinned },
  { name: "Substation", text: "Steps voltage down and feeds several feeders, for example Mirpur.", icon: Building2 },
  { name: "Feeder", text: "A power line leaving a substation, for example MIR-01.", icon: UtilityPole },
  { name: "Area", text: "A neighbourhood served by one feeder, for example Mirpur 10.", icon: House },
];

const values = [
  { title: "Transparency", text: "Customers should see planned outages and repair progress without calling a hotline.", icon: Eye },
  { title: "Faster response", text: "Reports reach the control room instantly and are linked to the right feeder and area.", icon: Gauge },
  { title: "Accountability", text: "Every assignment, repair note and restoration is recorded in a timeline.", icon: ShieldCheck },
];

const roles = [
  {
    title: "Customer",
    text: "Checks power status, reports outages and follows the repair.",
    icon: User,
    tint: "from-sky-500 to-cyan-400",
  },
  {
    title: "Technician",
    text: "Accepts assigned jobs, updates progress and uploads evidence.",
    icon: Wrench,
    tint: "from-amber-500 to-orange-400",
  },
  {
    title: "Administrator",
    text: "Manages the network, schedules load shedding and assigns repairs.",
    icon: ShieldCheck,
    tint: "from-indigo-500 to-violet-400",
  },
];

const highlights = [
  { value: "5", label: "Network levels" },
  { value: "3", label: "User roles" },
  { value: "1", label: "Shared workflow" },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-[#020617] text-slate-100">
      {/* Aurora background */}
      <div className="hero-grid-bg hero-grid-mask pointer-events-none absolute inset-0 opacity-60" />
      <div className="about-aurora pointer-events-none absolute -top-40 left-1/2 h-144 w-240 -translate-x-1/2 rounded-full bg-[conic-gradient(from_180deg,#0ea5e9,#6366f1,#22d3ee,#0ea5e9)] opacity-25 blur-3xl" />
      <div className="pointer-events-none absolute top-[45%] -left-40 size-112 rounded-full bg-electric/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 -right-40 size-112 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-24 px-4 pt-32 pb-20 md:pt-40">
        {/* Hero */}
        <header className="grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-sky-300 backdrop-blur">
              <Sparkles className="size-3.5" />
              About PowerGrid BD
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl">
              Keeping the lights on,{" "}
              <span className="bg-linear-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                together.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              The Load Shedding &amp; Power Management System helps an electricity distribution
              company manage planned load shedding and unexpected power failures. Customers report
              problems, administrators coordinate the response, and technicians carry out repairs,
              all in one workflow.
            </p>
            <p className="mt-4 max-w-2xl text-slate-500">
              This is an academic frontend project built with Next.js and TypeScript. It runs on
              sample data stored in your browser, so you can try every step safely.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="rounded-2xl border border-white/10 bg-white/3 p-4 backdrop-blur md:flex md:items-center md:gap-4"
              >
                <p className="bg-linear-to-br from-white to-sky-300 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
                  {h.value}
                </p>
                <p className="mt-1 text-xs text-slate-400 md:mt-0 md:text-sm">{h.label}</p>
              </div>
            ))}
          </div>
        </header>

        {/* Network hierarchy */}
        <section className="grid gap-10 md:grid-cols-[1fr_1.3fr]">
          <div className="md:sticky md:top-28 md:self-start">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">The network</p>
            <h2 className="mt-2 text-3xl font-bold text-white">How the network is organised</h2>
            <p className="mt-3 text-slate-400">
              Every outage is linked to this hierarchy, so the control room knows exactly who is
              affected.
            </p>
          </div>

          <ol className="relative space-y-4 pl-10">
            {/* Glowing wire with a pulse of current running down it */}
            <div className="absolute top-2 bottom-2 left-[15px] w-0.5 rounded-full bg-linear-to-b from-sky-400/70 via-indigo-400/50 to-sky-400/10" />
            <div className="about-pulse absolute left-[11px] size-2.5 rounded-full bg-sky-300 shadow-[0_0_12px_4px_rgb(56_189_248/0.7)]" />

            {levels.map((level, i) => (
              <li key={level.name} className="group relative">
                <span className="absolute top-4 -left-10 flex size-8 items-center justify-center rounded-full border border-sky-400/40 bg-[#0b1530] text-xs font-bold text-sky-300 ring-4 ring-[#020617] transition group-hover:bg-electric group-hover:text-white">
                  {i + 1}
                </span>
                <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/3 p-5 backdrop-blur transition duration-300 group-hover:translate-x-1 group-hover:border-sky-400/40 group-hover:bg-white/6">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-electric/15 text-sky-300 ring-1 ring-electric/30">
                    <level.icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{level.name}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{level.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Values: bento grid */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Our values</p>
          <h2 className="mt-2 text-3xl font-bold text-white">What we care about</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`group rounded-3xl bg-linear-to-br from-sky-400/40 via-white/10 to-indigo-500/40 p-px transition duration-300 hover:from-sky-300 hover:to-indigo-400 ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div className="relative h-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#050d24] p-6 md:p-8">
                  <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-electric/20 blur-3xl transition-opacity duration-300 group-hover:opacity-100 md:opacity-50" />
                  <span className="relative flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-electric to-indigo-600 text-white shadow-lg shadow-electric/40">
                    <v.icon className="size-6" />
                  </span>
                  <h3 className={`relative mt-5 font-bold text-white ${i === 0 ? "text-2xl md:text-3xl" : "text-lg"}`}>
                    {v.title}
                  </h3>
                  <p className={`relative mt-2 text-slate-400 ${i === 0 ? "max-w-md md:text-lg" : "text-sm"}`}>
                    {v.text}
                  </p>
                  {i === 0 && (
                    <Zap
                      className="pointer-events-none absolute -right-6 -bottom-8 hidden size-48 text-sky-400/10 md:block"
                      strokeWidth={1}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Who uses it</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Three roles, one workflow</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {roles.map((r) => (
              <div
                key={r.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-6 text-center backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/6"
              >
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r ${r.tint}`} />
                <div className={`pointer-events-none absolute -top-20 left-1/2 size-40 -translate-x-1/2 rounded-full bg-linear-to-r ${r.tint} opacity-20 blur-3xl transition-opacity group-hover:opacity-40`} />
                <span className={`relative mx-auto flex size-16 items-center justify-center rounded-2xl bg-linear-to-br ${r.tint} text-white shadow-xl`}>
                  <r.icon className="size-7" />
                </span>
                <p className="relative mt-5 text-lg font-bold text-white">{r.title}</p>
                <p className="relative mt-2 text-sm text-slate-400">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-sky-400/20 bg-linear-to-r from-electric/90 to-indigo-700 p-8 text-white shadow-2xl shadow-electric/30 md:p-12">
            <div className="hero-grid-bg pointer-events-none absolute inset-0 opacity-50" />
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-2xl font-bold md:text-3xl">See the workflow for yourself</p>
                <p className="mt-2 text-white/80">Try the demo as a customer, technician or admin.</p>
              </div>
              <Link
                href="/login"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90"
              >
                Open demo login
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
          <DemoNotice className="border-amber-400/30 bg-amber-400/10 text-amber-200" />
        </section>
      </div>
    </div>
  );
}
