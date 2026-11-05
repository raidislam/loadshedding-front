import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import { DemoNotice } from "@/components/public/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "Learn what the Load Shedding & Power Management System does and how the electricity network is organised.",
  openGraph: { title: "About | PowerGrid BD", description: "How the system models the electricity network and outage handling.", type: "website" },
};

const levels = [
  { name: "Power Authority", text: "The organisation that owns and runs the network." },
  { name: "Distribution Zone", text: "A large region, for example Dhaka North." },
  { name: "Substation", text: "Steps voltage down and feeds several feeders, for example Mirpur." },
  { name: "Feeder", text: "A power line leaving a substation, for example MIR-01." },
  { name: "Area", text: "A neighbourhood served by one feeder, for example Mirpur 10." },
];

const values = [
  { title: "Transparency", text: "Customers should see planned outages and repair progress without calling a hotline." },
  { title: "Faster response", text: "Reports reach the control room instantly and are linked to the right feeder and area." },
  { title: "Accountability", text: "Every assignment, repair note and restoration is recorded in a timeline." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary">About the system</h1>
        <p className="mt-3 text-muted-foreground">
          The Load Shedding &amp; Power Management System helps an electricity distribution
          company manage planned load shedding and unexpected power failures. Customers report
          problems, administrators coordinate the response, and technicians carry out repairs,
          all in one workflow.
        </p>
        <p className="mt-3 text-muted-foreground">
          This is an academic frontend project built with Next.js and TypeScript. It runs on
          sample data stored in your browser, so you can try every step safely.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold text-primary">How the network is organised</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every outage is linked to this hierarchy, so the control room knows exactly who is affected.
        </p>
        <ol className="mt-5 max-w-xl space-y-2">
          {levels.map((level, i) => (
            <li key={level.name}>
              <div className="rounded-lg border bg-card p-4" style={{ marginLeft: `${i * 16}px` }}>
                <p className="font-medium text-primary">{level.name}</p>
                <p className="text-sm text-muted-foreground">{level.text}</p>
              </div>
              {i < levels.length - 1 && (
                <ArrowDown className="my-1 ml-6 size-4 text-muted-foreground" style={{ marginLeft: `${i * 16 + 24}px` }} />
              )}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-primary">What we care about</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {values.map((v) => (
            <Card key={v.title}>
              <CardHeader>
                <CardTitle>{v.title}</CardTitle>
                <CardDescription>{v.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-primary">Three roles, one workflow</h2>
        <Card className="mt-5">
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div><p className="font-medium">Customer</p><p className="text-sm text-muted-foreground">Checks power status, reports outages and follows the repair.</p></div>
            <div><p className="font-medium">Technician</p><p className="text-sm text-muted-foreground">Accepts assigned jobs, updates progress and uploads evidence.</p></div>
            <div><p className="font-medium">Administrator</p><p className="text-sm text-muted-foreground">Manages the network, schedules load shedding and assigns repairs.</p></div>
          </CardContent>
        </Card>
      </section>

      <DemoNotice />
    </div>
  );
}
