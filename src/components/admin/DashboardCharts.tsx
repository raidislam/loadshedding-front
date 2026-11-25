"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Chart colours (same palette as the rest of the app)
const COLORS = ["#2f7bff", "#f5a524", "#14284b", "#16a34a", "#dc2626", "#64748b"];

export interface ChartPoint {
  name: string;
  value: number;
}

interface ChartCardProps {
  title: string;
  description: string;
  data: ChartPoint[];
  children: React.ReactNode;
}

function ChartCard({ title, description, data, children }: ChartCardProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">No data yet.</p>
        ) : (
          // The text summary is read by screen readers instead of the chart
          <div role="img" aria-label={`${title}: ${data.map((d) => `${d.name} ${d.value}`).join(", ")}`} className="h-64 w-full">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Bar chart of counts, e.g. outages by status
export function CountBarChart({ title, description, data, color = COLORS[0] }: Omit<ChartCardProps, "children"> & { color?: string }) {
  return (
    <ChartCard title={title} description={description} data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} interval={0} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip />
          <Bar dataKey="value" name="Count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// Donut chart of shares, e.g. users by role
export function SharePieChart({ title, description, data }: Omit<ChartCardProps, "children">) {
  return (
    <ChartCard title={title} description={description} data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} label>
            {data.map((d, i) => <Cell key={d.name} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend formatter={(v) => <span className="text-foreground">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
