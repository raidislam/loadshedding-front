"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DetailList, DetailSkeleton } from "@/components/shared/DetailList";
import { EmptyState } from "@/components/shared/EmptyState";
import { HierarchyBreadcrumb } from "@/components/shared/HierarchyBreadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressTimeline } from "@/components/shared/ProgressTimeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AVAILABILITY, OUTAGE_STATUS, OUTAGE_TYPE, PRIORITY } from "@/constants/statuses";
import { useLoad } from "@/hooks/useLoad";
import { formatDateTime } from "@/lib/format";
import { getAreas } from "@/services/areas";
import { getFeeders } from "@/services/feeders";
import { getOutageById, updateOutageStatus } from "@/services/outages";
import { getReportById } from "@/services/reports";
import { getSubstations } from "@/services/substations";
import { getTechnicians } from "@/services/technicians";
import { getZones } from "@/services/zones";
import type { OutageStatus } from "@/types";

async function loadDetail(id: string) {
  const outage = await getOutageById(id);
  const [zones, substations, feeders, areas, technicians, report] = await Promise.all([
    getZones(), getSubstations(), getFeeders(), getAreas(), getTechnicians(),
    outage?.reportId ? getReportById(outage.reportId) : Promise.resolve(undefined),
  ]);
  return { outage, zones, substations, feeders, areas, technicians, report };
}

interface PendingAction {
  status: OutageStatus;
  title: string;
  description: string;
  label: string;
  destructive?: boolean;
}

export function OutageDetail() {
  const { id } = useParams<{ id: string }>();
  // Wrapped in a key-less closure: reload() fetches the same outage again.
  const [loader] = useState(() => () => loadDetail(id));
  const { data, loading, error, reload } = useLoad(loader);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <DetailSkeleton />;
  if (error || !data) return <p className="text-destructive">{error}</p>;

  const { outage } = data;
  if (!outage) {
    return (
      <Card>
        <EmptyState title="Outage not found" description="This outage does not exist."
          action={<Link href="/admin/outages" className={buttonVariants({ variant: "outline", size: "sm" })}><ArrowLeft /> Back to outages</Link>} />
      </Card>
    );
  }

  const zone = data.zones.find((z) => z.id === outage.zoneId);
  const substation = data.substations.find((s) => s.id === outage.substationId);
  const feeder = data.feeders.find((f) => f.id === outage.feederId);
  const area = data.areas.find((a) => a.id === outage.areaId);
  const technician = data.technicians.find((t) => t.id === outage.technicianId);

  // Which admin actions make sense for the current status
  const actions: PendingAction[] = [];
  if (outage.status === "SCHEDULED") {
    actions.push({ status: "ACTIVE", label: "Start outage", title: "Start this outage now?", description: `Power in ${area?.name} will be marked as off.` });
  }
  if (outage.status === "ACTIVE") {
    actions.push({ status: "COMPLETED", label: "Mark power restored", title: "Mark this outage as completed?", description: "Customers will see the outage as finished." });
  }
  if (outage.status === "REPAIR_COMPLETED") {
    actions.push({ status: "RESTORED", label: "Confirm power restoration", title: "Confirm that power is restored?", description: `Customers in ${area?.name} will be notified that power is back.` });
  }
  if (["SCHEDULED", "ACTIVE", "ASSIGNED", "IN_PROGRESS"].includes(outage.status)) {
    actions.push({ status: "CANCELLED", label: "Cancel outage", destructive: true, title: "Cancel this outage?", description: "The outage will be closed without restoration. This cannot be undone." });
  }

  async function confirmAction() {
    if (!pending) return;
    setBusy(true);
    try {
      await updateOutageStatus(outage!.id, pending.status);
      toast.success(`Status changed to ${OUTAGE_STATUS[pending.status].label}.`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the outage.");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <HierarchyBreadcrumb zone={zone} substation={substation} feeder={feeder} area={area} />
        <PageHeader
          title={`Outage ${outage.id}`}
          description={outage.reason}
          actions={
            <>
              <StatusBadge {...OUTAGE_TYPE[outage.type]} />
              <StatusBadge {...OUTAGE_STATUS[outage.status]} />
              <Link href="/admin/outages" className={buttonVariants({ variant: "outline", size: "sm" })}><ArrowLeft /> All outages</Link>
            </>
          }
        />
      </div>

      {actions.length > 0 && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm font-medium">Actions</p>
            {actions.map((a) => (
              <Button key={a.status} variant={a.destructive ? "destructive" : "default"} onClick={() => setPending(a)}>
                {a.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <DetailList title="Outage details" items={[
        { label: "Priority", value: <StatusBadge {...PRIORITY[outage.priority]} /> },
        { label: "Affected area", value: area ? `${area.name} (${area.customerCount.toLocaleString("en-US")} customers)` : "-" },
        { label: "Start time", value: formatDateTime(outage.startTime) },
        { label: "Expected restoration", value: formatDateTime(outage.expectedRestoration) },
        { label: "Restored at", value: outage.restoredAt ? formatDateTime(outage.restoredAt) : "Not restored yet" },
        { label: "Customer report", value: outage.reportId ? <Link href={`/admin/reports?q=${outage.reportId}`} className="text-primary hover:underline">{outage.reportId}</Link> : "No customer report" },
        { label: "Description", value: <span className="font-normal">{outage.description}</span> },
      ]} />

      {outage.type === "UNEXPECTED" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Technician and repair progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {technician ? (
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div><dt className="text-sm text-muted-foreground">Technician</dt><dd className="font-medium">{technician.name}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Phone</dt><dd className="font-medium">{technician.phone}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Availability</dt><dd><StatusBadge {...AVAILABILITY[technician.availability]} /></dd></div>
                  <div><dt className="text-sm text-muted-foreground">Assigned</dt><dd className="font-medium">{formatDateTime(outage.assignedAt)}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Accepted</dt><dd className="font-medium">{outage.acceptedAt ? formatDateTime(outage.acceptedAt) : "Not yet"}</dd></div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">No technician assigned yet.</p>
              )}
              <div>
                <div className="mb-1 flex justify-between text-sm"><span>Repair progress</span><span className="font-medium">{outage.progress}%</span></div>
                <Progress value={outage.progress} />
              </div>
              {outage.completionSummary && (
                <div><p className="text-sm text-muted-foreground">Completion summary</p><p className="text-sm">{outage.completionSummary}</p></div>
              )}
              {outage.evidenceFiles.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Evidence files</p>
                  <ul className="list-disc pl-5 text-sm">{outage.evidenceFiles.map((f) => <li key={f}>{f}</li>)}</ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status timeline</CardTitle></CardHeader>
            <CardContent>
              {data.report ? <ProgressTimeline entries={data.report.timeline} /> : (
                <p className="text-sm text-muted-foreground">This outage was created by an admin, so there is no customer report timeline.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {outage.repairNotes.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Repair notes</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y">
              {outage.repairNotes.map((n) => (
                <li key={n.id} className="py-3">
                  <p className="text-sm">{n.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.author} · {formatDateTime(n.createdAt)} · progress {n.progress}%</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)} loading={busy}
        destructive={pending?.destructive} title={pending?.title ?? ""} description={pending?.description ?? ""}
        confirmLabel={pending?.label} onConfirm={confirmAction} />
    </div>
  );
}
