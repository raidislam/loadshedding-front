"use client";

import Link from "next/link";
import {
  Activity, AlertTriangle, Building2, CalendarClock, ClipboardList, Map, MapPin, Users, Wrench, Zap,
} from "lucide-react";
import { MonthlyOutageChart, OutageTypeChart, ZoneOutageChart } from "@/components/admin/OutageCharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CardsSkeleton } from "@/components/shared/TableSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OPEN_STATUSES, OUTAGE_STATUS, OUTAGE_TYPE, REPORT_CATEGORY_LABEL } from "@/constants/statuses";
import { useLoad } from "@/hooks/useLoad";
import { formatDateTime } from "@/lib/format";
import { getAreas } from "@/services/areas";
import {
  getDashboardStats, getMonthlyOutageStats, getOutageTypeStats, getRecentActivities, getZoneOutageStats,
} from "@/services/dashboard";
import { getOutages } from "@/services/outages";
import { getReports } from "@/services/reports";

async function loadOverview() {
  const [stats, monthly, types, zones, outages, reports, activities, areas] = await Promise.all([
    getDashboardStats(), getMonthlyOutageStats(), getOutageTypeStats(), getZoneOutageStats(),
    getOutages(), getReports(), getRecentActivities(), getAreas(),
  ]);
  return { stats, monthly, types, zones, outages, reports, activities, areas };
}

export function AdminOverview() {
  const { data, error } = useLoad(loadOverview);

  if (error) return <p className="text-destructive">{error}</p>;

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Overview" description="Network status at a glance." />
        <CardsSkeleton count={8} />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80" /><Skeleton className="h-80" /><Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const { stats, outages, reports, activities, areas } = data;
  const areaName = (id: string) => areas.find((a) => a.id === id)?.name ?? "-";
  const critical = outages.filter((o) => o.priority === "CRITICAL" && OPEN_STATUSES.includes(o.status));
  const recentOutages = [...outages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentReports = reports.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="Network status at a glance. All figures are demo data." />

      {critical.length > 0 && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 font-medium text-red-800">
            <AlertTriangle className="size-4" /> {critical.length === 1 ? "1 critical outage needs" : `${critical.length} critical outages need`} attention
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-900">
            {critical.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/outages/${o.id}`} className="font-medium underline">{o.id}</Link>
                {" · "}{areaName(o.areaId)} · {o.reason} · expected restoration {formatDateTime(o.expectedRestoration)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total zones" value={stats.totalZones} icon={MapPin} />
        <StatCard title="Total substations" value={stats.totalSubstations} icon={Building2} />
        <StatCard title="Total feeders" value={stats.totalFeeders} icon={Zap} />
        <StatCard title="Total areas" value={stats.totalAreas} icon={Map} />
        <StatCard title="Active outages" value={stats.activeOutages} icon={Activity} tone="danger" />
        <StatCard title="Scheduled outages" value={stats.scheduledOutages} icon={CalendarClock} />
        <StatCard title="Pending reports" value={stats.pendingReports} icon={ClipboardList} tone="warning" />
        <StatCard title="Available technicians" value={stats.availableTechnicians} icon={Wrench} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><MonthlyOutageChart data={data.monthly} /></div>
        <OutageTypeChart data={data.types} />
      </div>
      <ZoneOutageChart data={data.zones} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent outages</CardTitle>
            <CardAction><Link href="/admin/outages" className={buttonVariants({ variant: "ghost", size: "sm" })}>View all</Link></CardAction>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentOutages.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/admin/outages/${o.id}`} className="font-medium text-primary hover:underline">{o.id}</Link>
                    <p className="truncate text-sm text-muted-foreground">{areaName(o.areaId)} · {formatDateTime(o.startTime)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <StatusBadge {...OUTAGE_TYPE[o.type]} />
                    <StatusBadge {...OUTAGE_STATUS[o.status]} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent customer reports</CardTitle>
            <CardAction><Link href="/admin/reports" className={buttonVariants({ variant: "ghost", size: "sm" })}>View all</Link></CardAction>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentReports.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-medium">{r.id} <span className="font-normal text-muted-foreground">· {areaName(r.areaId)}</span></p>
                    <p className="truncate text-sm text-muted-foreground">{REPORT_CATEGORY_LABEL[r.category]}</p>
                  </div>
                  <StatusBadge {...OUTAGE_STATUS[r.status]} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="size-4" /> Latest system activity</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {activities.map((a) => (
              <li key={a.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
                <span className="text-sm">{a.message}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
