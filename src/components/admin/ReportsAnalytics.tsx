"use client";

import { MonthlyOutageChart, ZoneOutageChart } from "@/components/admin/OutageCharts";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AVAILABILITY, OUTAGE_STATUS } from "@/constants/statuses";
import { ClipboardCheck, ClipboardList, Timer } from "lucide-react";
import type { MonthlyOutageStat, Outage, OutageReport, Technician, ZoneOutageStat } from "@/types";

interface Props {
  monthly: MonthlyOutageStat[];
  zones: ZoneOutageStat[];
  reports: OutageReport[];
  outages: Outage[];
  technicians: Technician[];
}

interface WorkloadRow { tech: Technician; open: number; done: number }

export function ReportsAnalytics({ monthly, zones, reports, outages, technicians }: Props) {
  const resolved = reports.filter((r) => r.status === "RESTORED").length;
  const resolvedPercent = reports.length ? Math.round((resolved / reports.length) * 100) : 0;

  // Average time between the problem starting and power being restored
  const restored = outages.filter((o) => o.type === "UNEXPECTED" && o.status === "RESTORED" && o.restoredAt);
  const avgHours = restored.length
    ? restored.reduce((sum, o) => sum + (new Date(o.restoredAt!).getTime() - new Date(o.startTime).getTime()) / 3_600_000, 0) / restored.length
    : 0;

  const statusCounts = Object.entries(OUTAGE_STATUS)
    .map(([status, info]) => ({ status, info, count: reports.filter((r) => r.status === status).length }))
    .filter((s) => s.count > 0);

  const workload: WorkloadRow[] = technicians.map((tech) => ({
    tech,
    open: outages.filter((o) => o.technicianId === tech.id && ["ASSIGNED", "IN_PROGRESS"].includes(o.status)).length,
    done: outages.filter((o) => o.technicianId === tech.id && ["REPAIR_COMPLETED", "RESTORED"].includes(o.status)).length,
  }));

  const columns: Column<WorkloadRow>[] = [
    { header: "Technician", cell: (r) => <span className="font-medium">{r.tech.name}</span> },
    { header: "Specialty", cell: (r) => r.tech.specialty, className: "hidden md:table-cell" },
    { header: "Open jobs", cell: (r) => r.open },
    { header: "Finished jobs", cell: (r) => r.done },
    { header: "Availability", cell: (r) => <StatusBadge {...AVAILABILITY[r.tech.availability]} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Customer reports" value={reports.length} icon={ClipboardList} />
        <StatCard title="Resolved reports" value={`${resolvedPercent}%`} icon={ClipboardCheck} tone="success" hint={`${resolved} of ${reports.length} restored`} />
        <StatCard title="Average restoration time" value={restored.length ? `${avgHours.toFixed(1)} h` : "-"} icon={Timer} tone="warning" hint="Unexpected outages" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyOutageChart data={monthly} />
        <ZoneOutageChart data={zones} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4"><CardTitle>Reports by status</CardTitle></CardHeader>
          <ul className="divide-y">
            {statusCounts.map((s) => (
              <li key={s.status} className="flex items-center justify-between px-4 py-3">
                <StatusBadge {...s.info} />
                <span className="font-medium">{s.count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4"><CardTitle>Technician workload</CardTitle></CardHeader>
          <DataTable columns={columns} rows={workload} getRowId={(r) => r.tech.id} />
        </Card>
      </div>
    </div>
  );
}
