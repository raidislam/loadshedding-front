import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CalendarClock,
  ClipboardCheck,
  FilePlus,
  MapPinned,
  Wrench,
} from "lucide-react";
import { DemoNotice } from "@/components/public/DemoNotice";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  { label: "Distribution zones", value: zones.length },
  { label: "Substations", value: substations.length },
  { label: "Feeders", value: feeders.length },
  { label: "Service areas", value: areas.length },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              Demo project · Bangladesh-inspired sample data
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              Know when the power goes off, and when it comes back.
            </h1>
            <p className="mt-4 text-primary-foreground/80">
              PowerGrid BD brings load shedding schedules, outage reports and repair progress into
              one simple system for customers, technicians and administrators.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/outage-status"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[color:var(--electric)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110"
              >
                Check outage status
              </Link>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg", className: "h-10 border-white/30 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white" })}>
                Try the demo
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-center">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg bg-white/10 p-4">
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-sm text-primary-foreground/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold text-primary">What you can do</h2>
        <p className="mt-1 text-muted-foreground">Everything in one place, for everyone involved.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <f.icon className="mb-1 size-6 text-electric" />
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold text-primary">How an outage is handled</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-lg border p-4">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="mt-3 font-medium">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-14">
        <Card>
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-primary">Want to see it in action?</p>
              <p className="text-sm text-muted-foreground">
                Log in with one click as an admin, a customer or a technician.
              </p>
            </div>
            <Link href="/login" className={buttonVariants({ size: "lg", className: "h-10 px-4" })}>
              Open demo login
            </Link>
          </CardContent>
        </Card>
        <DemoNotice />
      </section>
    </>
  );
}
