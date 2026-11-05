"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyOutageStat, ZoneOutageStat } from "@/types";

// Chart colours (same palette as the rest of the app)
const BLUE = "#2f7bff";
const AMBER = "#f5a524";
const NAVY = "#14284b";

interface ChartCardProps {
  title: string;
  description: string;
  summary: string; // read by screen readers
  children: React.ReactNode;
}

function ChartCard({ title, description, summary, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label={summary} className="h-64 w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyOutageChart({ data }: { data: MonthlyOutageStat[] }) {
  return (
    <ChartCard title="Monthly outage statistics" description="Scheduled and unexpected outages per month"
      summary={`Bar chart of monthly outages for the last ${data.length} months`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip />
          <Legend formatter={(v) => <span className="text-foreground">{v}</span>} />
          <Bar dataKey="scheduled" name="Scheduled" fill={BLUE} radius={[4, 4, 0, 0]} />
          <Bar dataKey="unexpected" name="Unexpected" fill={AMBER} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function OutageTypeChart({ data }: { data: { name: string; value: number }[] }) {
  const colors = [BLUE, AMBER];
  return (
    <ChartCard title="Scheduled vs unexpected" description="Share of all recorded outages"
      summary={`Pie chart: ${data.map((d) => `${d.name} ${d.value}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} label>
            {data.map((d, i) => <Cell key={d.name} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend formatter={(v) => <span className="text-foreground">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ZoneOutageChart({ data }: { data: ZoneOutageStat[] }) {
  return (
    <ChartCard title="Zone-wise outages" description="Number of outages recorded in each zone"
      summary={`Bar chart of outages per zone: ${data.map((d) => `${d.zone} ${d.outages}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <YAxis type="category" dataKey="zone" width={90} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip />
          <Bar dataKey="outages" name="Outages" fill={NAVY} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
