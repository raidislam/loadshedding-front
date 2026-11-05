import { Check } from "lucide-react";
import { OUTAGE_STATUS, TECHNICIAN_STEPS } from "@/constants/statuses";
import { cn } from "@/lib/utils";
import type { OutageStatus } from "@/types";

// ASSIGNED > IN_PROGRESS > REPAIR_COMPLETED > RESTORED, with the current step highlighted.
export function WorkflowSteps({ status }: { status: OutageStatus }) {
  const current = TECHNICIAN_STEPS.indexOf(status);
  return (
    <ol
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      aria-label="Job workflow"
    >
      {TECHNICIAN_STEPS.map((step, i) => {
        const done = i < current || (i === current && status === "RESTORED");
        const isCurrent = i === current && !done;
        return (
          <li
            key={step}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg border p-3 text-sm",
              done && "border-green-300 bg-green-50 text-green-800",
              isCurrent && "border-primary bg-primary text-primary-foreground",
              !done && !isCurrent && "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                done
                  ? "bg-green-500 text-white"
                  : isCurrent
                    ? "bg-white/20"
                    : "border",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className="font-medium">{OUTAGE_STATUS[step].label}</span>
          </li>
        );
      })}
    </ol>
  );
}
