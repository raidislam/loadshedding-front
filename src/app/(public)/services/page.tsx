import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CalendarClock, FilePlus, History, Network, Wrench } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Services",
  description: "Outage reporting, load shedding schedules, technician dispatch, notifications and network management.",
  openGraph: { title: "Services | PowerGrid BD", description: "What the power management system offers customers, technicians and administrators.", type: "website" },
};

const services = [
  { icon: CalendarClock, title: "Load shedding schedules", for: "Customers", points: ["Upcoming planned outages for your area", "Start time and expected restoration time", "Reason for each outage"] },
  { icon: FilePlus, title: "Outage reporting", for: "Customers", points: ["Report no power, voltage problems or damaged lines", "Attach a photo of the problem", "Track your report from submission to restoration"] },
  { icon: Wrench, title: "Repair management", for: "Technicians", points: ["See assigned jobs with priority and location", "Accept, start and complete repairs", "Add repair notes and upload evidence"] },
  { icon: Network, title: "Network management", for: "Administrators", points: ["Manage zones, substations, feeders and areas", "Schedule outages with a step-by-step form", "Assign technicians to customer reports"] },
  { icon: Bell, title: "Notifications", for: "Customers", points: ["Announcements for scheduled outages", "Alerts for unexpected outages", "Technician assignment and restoration updates"] },
  { icon: History, title: "Reports and history", for: "Everyone", points: ["Charts of monthly and zone-wise outages", "Completed job history for technicians", "Outage history for customers"] },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary">Our services</h1>
        <p className="mt-3 text-muted-foreground">
          Each feature is designed for one of three roles. Log in with a demo account to try them.
        </p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <s.icon className="mb-1 size-6 text-electric" />
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>For {s.for.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/outage-status" className={buttonVariants({ size: "lg", className: "h-10 px-4" })}>
          View outage status
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg", className: "h-10 px-4" })}>
          Try a demo account
        </Link>
      </div>
    </div>
  );
}
