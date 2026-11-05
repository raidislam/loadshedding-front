"use client";

import { useCallback } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, FilePlus, MapPin } from "lucide-react";
import { useRequiredUser } from "@/components/layout/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NOTIFICATION_TYPE } from "@/constants/notifications";
import { OPEN_STATUSES, OUTAGE_STATUS, OUTAGE_TYPE, REPORT_CATEGORY_LABEL } from "@/constants/statuses";
import { useLoad } from "@/hooks/useLoad";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getAreas } from "@/services/areas";
import { getFeeders } from "@/services/feeders";
import { getNotifications } from "@/services/notifications";
import { getOutagesForArea } from "@/services/outages";
import { getCustomerReports } from "@/services/reports";
import { getSubstations } from "@/services/substations";
import { getZones } from "@/services/zones";

async function loadOverview(userId: string, areaId: string) {
  const [outages, reports, notifications, areas, zones, substations, feeders] = await Promise.all([
    getOutagesForArea(areaId), getCustomerReports(userId), getNotifications(userId),
    getAreas(), getZones(), getSubstations(), getFeeders(),
  ]);
  const now = new Date().toISOString();
  const area = areas.find((a) => a.id === areaId);
  return {
    area,
    zone: zones.find((z) => z.id === area?.zoneId),
    substation: substations.find((s) => s.id === area?.substationId),
    feeder: feeders.find((f) => f.id === area?.feederId),
    // an outage that is happening right now in the customer's area
    currentOutage: outages.find((o) => OPEN_STATUSES.includes(o.status)),
    // the soonest planned outage that has not started
    nextScheduled: outages
      .filter((o) => o.status === "SCHEDULED" && o.startTime > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0],
    history: outages.filter((o) => ["RESTORED", "COMPLETED"].includes(o.status)).slice(0, 5),
    reports: reports.slice(0, 3),
    notifications: notifications.slice(0, 4),
  };
}

export function CustomerOverview() {
  const user = useRequiredUser();
  const areaId = user.areaId ?? "";
  const loader = useCallback(() => loadOverview(user.id, areaId), [user.id, areaId]);
  const { data, error } = useLoad(loader);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Dashboard" />
        <Skeleton className="h-36 w-full" />
        <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
      </div>
    );
  }

  const { area, zone, substation, feeder, currentOutage, nextScheduled, history, reports, notifications } = data;
  const powerOff = !!currentOutage;

  return (
    <div className="space-y-6">
      <PageHeader title={`Hello, ${user.name.split(" ")[0]}`} description="Your electricity status at a glance. This is demo data."
        actions={<Link href="/dashboard/report-outage" className={buttonVariants()}><FilePlus /> Report an outage</Link>} />

      <Card className={cn("border-2", powerOff ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50")}>
        <CardContent className="flex items-start gap-4">
          <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", powerOff ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
            {powerOff ? <AlertTriangle className="size-6" /> : <CheckCircle2 className="size-6" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Current power status in {area?.name ?? "your area"}</p>
            <p className={cn("text-xl font-semibold", powerOff ? "text-red-800" : "text-green-800")}>
              {powerOff ? "Power outage in your area" : "Power is on"}
            </p>
            {currentOutage ? (
              <div className="mt-2 space-y-1 text-sm">
                <p>{currentOutage.reason}: {currentOutage.description}</p>
                <p><span className="text-muted-foreground">Started:</span> {formatDateTime(currentOutage.startTime)}</p>
                <p><span className="text-muted-foreground">Expected restoration:</span> <strong>{formatDateTime(currentOutage.expectedRestoration)}</strong></p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <StatusBadge {...OUTAGE_TYPE[currentOutage.type]} />
                  <StatusBadge {...OUTAGE_STATUS[currentOutage.status]} />
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-green-900">No outage is reported for your area right now.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock className="size-4" /> Next scheduled outage</CardTitle>
          </CardHeader>
          <CardContent>
            {nextScheduled ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{nextScheduled.reason}</p>
                <p><span className="text-muted-foreground">From:</span> {formatDateTime(nextScheduled.startTime)}</p>
                <p><span className="text-muted-foreground">Power back by:</span> {formatDateTime(nextScheduled.expectedRestoration)}</p>
                <p className="text-muted-foreground">{nextScheduled.description}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No planned outages for your area at the moment.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="size-4" /> Your service area</CardTitle>
            <CardDescription>Customer no. {user.customerNumber ?? "-"}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Area</dt><dd className="font-medium">{area?.name ?? "-"}</dd></div>
              <div><dt className="text-muted-foreground">Zone</dt><dd className="font-medium">{zone?.name ?? "-"}</dd></div>
              <div><dt className="text-muted-foreground">Substation</dt><dd className="font-medium">{substation?.name ?? "-"}</dd></div>
              <div><dt className="text-muted-foreground">Feeder</dt><dd className="font-medium">{feeder?.code ?? "-"}</dd></div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent reports</CardTitle>
            <CardAction><Link href="/dashboard/my-reports" className={buttonVariants({ variant: "ghost", size: "sm" })}>View all</Link></CardAction>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? <p className="text-sm text-muted-foreground">You have not reported any problems yet.</p> : (
              <ul className="divide-y">
                {reports.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="font-medium">{r.id}</p>
                      <p className="truncate text-sm text-muted-foreground">{REPORT_CATEGORY_LABEL[r.category]} · {formatDateTime(r.createdAt)}</p>
                    </div>
                    <StatusBadge {...OUTAGE_STATUS[r.status]} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent notifications</CardTitle>
            <CardAction><Link href="/dashboard/notifications" className={buttonVariants({ variant: "ghost", size: "sm" })}>View all</Link></CardAction>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? <p className="text-sm text-muted-foreground">No notifications yet.</p> : (
              <ul className="divide-y">
                {notifications.map((n) => {
                  const type = NOTIFICATION_TYPE[n.type];
                  return (
                    <li key={n.id} className="flex items-start gap-3 py-2.5">
                      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", type.className)}><type.icon className="size-3.5" /></span>
                      <div className="min-w-0">
                        <p className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outage history in your area</CardTitle>
          <CardDescription>Past outages that have been fixed.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? <p className="text-sm text-muted-foreground">No past outages recorded for your area.</p> : (
            <ul className="divide-y">
              {history.map((o) => (
                <li key={o.id} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{o.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(o.startTime)} to {formatDateTime(o.restoredAt)}</p>
                  </div>
                  <div className="flex gap-1.5"><StatusBadge {...OUTAGE_TYPE[o.type]} /><StatusBadge {...OUTAGE_STATUS[o.status]} /></div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
