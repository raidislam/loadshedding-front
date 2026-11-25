"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { ProgressTimeline } from "@/components/shared/ProgressTimeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { REPORT_STATUS } from "@/constants/labels";
import { useDetail } from "@/hooks/useApi";
import { errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { OutageReport } from "@/types/api";

// Full details of one report: GET /outage-reports/:id
// (only the owner or an admin may open it; anyone else gets 404 from the backend)
export function ReportDetailsDialog({ reportId, onClose }: { reportId: string | null; onClose: () => void }) {
  return (
    <FormDialog open={!!reportId} onOpenChange={(o) => !o && onClose()} title="Report details" description="Follow the progress of the report.">
      {reportId && <ReportDetails id={reportId} />}
    </FormDialog>
  );
}

function ReportDetails({ id }: { id: string }) {
  const { data: report, isLoading, error } = useDetail<OutageReport>("outage-reports", id);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error || !report) return <p className="text-destructive">{errorMessage(error)}</p>;

  const technician = report.assignment?.technician;
  const repair = report.assignment?.repairRecords?.[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge {...REPORT_STATUS[report.status]} />
        <span className="font-medium">{report.title}</span>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Item label="Reported" value={formatDateTime(report.createdAt)} />
        <Item label="Area" value={`${report.area.name}, ${report.area.feeder.substation.zone.name}`} />
        <Item label="Location" value={report.address ?? "-"} />
        <Item label="Technician" value={technician ? `${technician.name}${technician.phone ? ` (${technician.phone})` : ""}` : "Not assigned yet"} />
        {report.outage && <Item label="Linked outage" value={`${report.outage.title}`} />}
        {report.restoredAt && <Item label="Power restored" value={formatDateTime(report.restoredAt)} />}
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Description</dt>
          <dd>{report.description}</dd>
        </div>
        {report.adminNote && report.status !== "REJECTED" && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Note from the control room</dt>
            <dd>{report.adminNote}</dd>
          </div>
        )}
        {repair && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Repair work done</dt>
            <dd>
              {repair.workDescription}
              {repair.partsUsed ? ` (parts: ${repair.partsUsed})` : ""}
            </dd>
          </div>
        )}
      </dl>
      <div>
        <p className="mb-3 text-sm font-medium">Progress</p>
        <ProgressTimeline report={report} />
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
