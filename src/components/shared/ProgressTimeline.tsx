import { Check, Circle, X } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OutageReport, ReportStatus } from "@/types/api";

// Order of a report's life: Submitted > Under review > Technician assigned > Repair in progress > Resolved
const STEPS: { status: ReportStatus; label: string }[] = [
  { status: "PENDING", label: "Report submitted" },
  { status: "UNDER_REVIEW", label: "Under review" },
  { status: "ASSIGNED", label: "Technician assigned" },
  { status: "IN_PROGRESS", label: "Repair in progress" },
  { status: "RESOLVED", label: "Power restored" },
];

// The time of each step, taken from the report and its assignment
function stepTime(report: OutageReport, status: ReportStatus): string | null | undefined {
  const a = report.assignment;
  switch (status) {
    case "PENDING":
      return report.createdAt;
    case "ASSIGNED":
      return a?.assignedAt;
    case "IN_PROGRESS":
      return a?.startedAt;
    case "RESOLVED":
      return report.restoredAt;
    default:
      return null;
  }
}

// Shows how far a customer report has come
export function ProgressTimeline({ report }: { report: OutageReport }) {
  if (report.status === "REJECTED") {
    return (
      <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
        <X className="mt-0.5 size-4 shrink-0 text-red-700" />
        <div>
          <p className="font-medium text-red-800">Report rejected</p>
          <p className="text-red-900">{report.adminNote ?? "No reason given."}</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === report.status);

  return (
    <ol>
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const time = stepTime(report, step.status);
        return (
          <li key={step.status} className="relative flex gap-3 pb-6 last:pb-0">
            {i < STEPS.length - 1 && (
              <span aria-hidden className={cn("absolute left-3 top-6 h-full w-0.5 -translate-x-1/2", i < currentIndex ? "bg-green-500" : "bg-border")} />
            )}
            <span className={cn("z-10 flex size-6 shrink-0 items-center justify-center rounded-full", done ? "bg-green-500 text-white" : "border bg-card text-muted-foreground")}>
              {done ? <Check className="size-3.5" /> : <Circle className="size-2.5" />}
            </span>
            <div>
              <p className={cn("text-sm font-medium", !done && "text-muted-foreground")}>{step.label}</p>
              <p className="text-xs text-muted-foreground">{done ? (time ? formatDateTime(time) : "Done") : "Waiting"}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
