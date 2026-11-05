"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { ProgressTimeline } from "@/components/shared/ProgressTimeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { OUTAGE_STATUS, REPORT_CATEGORY_LABEL } from "@/constants/statuses";
import { formatDateTime } from "@/lib/format";
import type { Area, OutageReport, Technician } from "@/types";

interface Props {
  report: OutageReport | null; // null = closed
  area?: Area;
  technician?: Technician;
  onClose: () => void;
}

export function ReportDetailsDialog({ report, area, technician, onClose }: Props) {
  return (
    <FormDialog open={!!report} onOpenChange={(o) => !o && onClose()} title={report ? `Report ${report.id}` : "Report"}
      description="Follow the progress of your report.">
      {report && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge {...OUTAGE_STATUS[report.status]} />
            <span className="text-sm text-muted-foreground">{REPORT_CATEGORY_LABEL[report.category]}</span>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Reported</dt><dd className="font-medium">{formatDateTime(report.createdAt)}</dd></div>
            <div><dt className="text-muted-foreground">Problem started</dt><dd className="font-medium">{formatDateTime(report.problemStart)}</dd></div>
            <div><dt className="text-muted-foreground">Location</dt><dd className="font-medium">{report.location}</dd></div>
            <div><dt className="text-muted-foreground">Area</dt><dd className="font-medium">{area?.name ?? "-"}</dd></div>
            <div><dt className="text-muted-foreground">Technician</dt>
              <dd className="font-medium">{technician ? `${technician.name} (${technician.phone})` : "Not assigned yet"}</dd></div>
            <div><dt className="text-muted-foreground">{report.status === "RESTORED" ? "Power restored" : "Estimated restoration"}</dt>
              <dd className="font-medium">{report.estimatedRestoration ? formatDateTime(report.estimatedRestoration) : "Will be updated after review"}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted-foreground">Your description</dt><dd>{report.description}</dd></div>
            {report.imageName && <div className="sm:col-span-2"><dt className="text-muted-foreground">Photo</dt><dd className="font-medium">{report.imageName}</dd></div>}
          </dl>
          <div>
            <p className="mb-3 text-sm font-medium">Progress</p>
            <ProgressTimeline entries={report.timeline} />
          </div>
        </div>
      )}
    </FormDialog>
  );
}
