"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity, AlertTriangle, Banknote, Building2, CalendarClock, ClipboardList, History, Map, MapPin, Receipt, Users, Wrench, Zap,
} from "lucide-react";
import Link from "next/link";
import { CountBarChart, SharePieChart } from "@/components/admin/DashboardCharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CardsSkeleton } from "@/components/shared/TableSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ASSIGNMENT_STATUS, OUTAGE_STATUS, OUTAGE_TYPE, REPORT_STATUS, actionLabel } from "@/constants/labels";
import { ROLE_LABEL } from "@/constants/navigation";
import { useList } from "@/hooks/useApi";
import { api, errorMessage } from "@/lib/api";
import { formatDateTime, formatNumber, formatTaka } from "@/lib/format";
import type { AuditLog, DashboardStats, Outage, OutageReport } from "@/types/api";

// { PENDING: 3, RESOLVED: 1 } + label map -> [{ name: "Pending", value: 3 }, ...] for the charts
function toChart<K extends string>(counts: NoInfer<Record<K, number>>, labels: Record<K, { label: string }>) {
  return (Object.keys(labels) as K[]).map((key) => ({ name: labels[key].label, value: counts[key] ?? 0 }));
}

export function AdminOverview() {
  // GET /admin/dashboard-stats - all the numbers in one request
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin/dashboard-stats"],
    queryFn: async () => (await api<DashboardStats>("/admin/dashboard-stats")).data,
  });
  // Latest 5 of each list (the backend sorts by createdAt desc by default)
  const outages = useList<Outage>("outages", { limit: 5 });
  const reports = useList<OutageReport>("outage-reports", { limit: 5 });
  const logs = useList<AuditLog>("admin/audit-logs", { limit: 6 });

  if (error) return <p className="text-destructive">{errorMessage(error)}</p>;

  if (isLoading || !stats) {
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

  const roleLabels = { ADMIN: { label: ROLE_LABEL.ADMIN }, CUSTOMER: { label: ROLE_LABEL.CUSTOMER }, TECHNICIAN: { label: ROLE_LABEL.TECHNICIAN } };

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="Live figures from the database." />

      {stats.outages.ONGOING > 0 && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 font-medium text-red-800">
            <AlertTriangle className="size-4" />
            {stats.outages.ONGOING === 1 ? "1 outage is ongoing right now" : `${stats.outages.ONGOING} outages are ongoing right now`}
          </p>
          <Link href="/admin/outages?status=ONGOING" className={buttonVariants({ variant: "outline", size: "sm" })}>View ongoing</Link>
        </div>
      )}

      {/* Network */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Zones" value={stats.network.zones} icon={MapPin} />
        <StatCard title="Substations" value={stats.network.substations} icon={Building2} />
        <StatCard title="Feeders" value={stats.network.feeders} icon={Zap} />
        <StatCard title="Areas" value={stats.network.areas} icon={Map} />
      </div>

      {/* Work */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ongoing outages" value={stats.outages.ONGOING} icon={Activity} tone="danger" />
        <StatCard title="Upcoming scheduled" value={stats.outages.upcomingScheduled} icon={CalendarClock} />
        <StatCard title="Open reports" value={stats.reports.open} icon={ClipboardList} tone="warning" hint={`${stats.reports.PENDING} waiting for review`} />
        <StatCard title="Repairs in progress" value={stats.assignments.IN_PROGRESS} icon={Wrench} tone="warning" hint={`${stats.assignments.ASSIGNED} not yet accepted`} />
      </div>

      {/* Users and money */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Users" value={stats.users.total} icon={Users} hint={`${stats.users.blocked} blocked`} />
        <StatCard title="Revenue (all time)" value={formatTaka(stats.payments.totalRevenue)} icon={Banknote} tone="success"
          hint={`${formatNumber(stats.payments.successfulPayments)} successful payments`} />
        <StatCard title="Revenue this month" value={formatTaka(stats.payments.thisMonthRevenue)} icon={Banknote} tone="success"
          hint={`${formatNumber(stats.payments.thisMonthPayments)} payments`} />
        <StatCard title="Unpaid bills" value={stats.payments.unpaidBills} icon={Receipt} tone="warning" hint={`${formatTaka(stats.payments.unpaidAmount)} due`} />
      </div>

      {/* Charts built from the same stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <CountBarChart title="Outages by status" description="All outages in the system" data={toChart(stats.outages, OUTAGE_STATUS)} />
        <CountBarChart title="Customer reports by status" description="Where each report is in the workflow" data={toChart(stats.reports, REPORT_STATUS)} color="#f5a524" />
        <SharePieChart title="Users by role" description="Active and blocked accounts" data={toChart(stats.users, roleLabels)} />
      </div>
      <CountBarChart title="Repair jobs by status" description="Technician assignments" data={toChart(stats.assignments, ASSIGNMENT_STATUS)} color="#14284b" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent outages</CardTitle>
            <CardAction><Link href="/admin/outages" className={buttonVariants({ variant: "ghost", size: "sm" })}>View all</Link></CardAction>
          </CardHeader>
          <CardContent>
            {outages.isLoading ? <Skeleton className="h-48" /> : (
              <ul className="divide-y">
                {(outages.data?.data ?? []).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <Link href={`/admin/outages/${o.id}`} className="font-medium text-primary hover:underline">{o.title}</Link>
                      <p className="truncate text-sm text-muted-foreground">{o.area.name} · {formatDateTime(o.startTime)}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <StatusBadge {...OUTAGE_TYPE[o.type]} />
                      <StatusBadge {...OUTAGE_STATUS[o.status]} />
                    </div>
                  </li>
                ))}
                {outages.data?.data.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No outages yet.</li>}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent customer reports</CardTitle>
            <CardAction><Link href="/admin/reports" className={buttonVariants({ variant: "ghost", size: "sm" })}>View all</Link></CardAction>
          </CardHeader>
          <CardContent>
            {reports.isLoading ? <Skeleton className="h-48" /> : (
              <ul className="divide-y">
                {(reports.data?.data ?? []).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{r.area.name}{r.customer ? ` · ${r.customer.name}` : ""}</p>
                    </div>
                    <StatusBadge {...REPORT_STATUS[r.status]} />
                  </li>
                ))}
                {reports.data?.data.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No reports yet.</li>}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="size-4" /> Latest system activity</CardTitle>
          <CardAction><Link href="/admin/audit-logs" className={buttonVariants({ variant: "ghost", size: "sm" })}>Audit log</Link></CardAction>
        </CardHeader>
        <CardContent>
          {logs.isLoading ? <Skeleton className="h-40" /> : (
            <ul className="divide-y">
              {(logs.data?.data ?? []).map((l) => (
                <li key={l.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="text-sm">
                    <span className="font-medium">{actionLabel(l.action)}</span>
                    <span className="text-muted-foreground"> · {l.user?.name ?? "System"}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(l.createdAt)}</span>
                </li>
              ))}
              {logs.data?.data.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No activity yet.</li>}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
