import { Check, Circle } from "lucide-react";
import { OUTAGE_STATUS, REPAIR_STEPS } from "@/constants/statuses";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "@/types";

// Shows the repair workflow: Reported > Assigned > In progress > Repair completed > Restored.
// Steps that already happened show their time and note, the rest are greyed out.
export function ProgressTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="space-y-0">
      {REPAIR_STEPS.map((step, i) => {
        const entry = [...entries].reverse().find((e) => e.status === step);
        const done = !!entry;
        const isLast = i === REPAIR_STEPS.length - 1;
        return (
          <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span aria-hidden className={cn("absolute left-3 top-6 h-full w-0.5 -translate-x-1/2", done ? "bg-green-500" : "bg-border")} />
            )}
            <span className={cn("z-10 flex size-6 shrink-0 items-center justify-center rounded-full", done ? "bg-green-500 text-white" : "border bg-card text-muted-foreground")}>
              {done ? <Check className="size-3.5" /> : <Circle className="size-2.5" />}
            </span>
            <div>
              <p className={cn("text-sm font-medium", !done && "text-muted-foreground")}>
                {OUTAGE_STATUS[step].label}
              </p>
              {entry ? (
                <>
                  <p className="text-xs text-muted-foreground">{formatDateTime(entry.at)}</p>
                  <p className="text-sm">{entry.note}</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Waiting</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
