import { Check } from "lucide-react";
import { ASSIGNMENT_STATUS } from "@/constants/labels";
import { cn } from "@/lib/utils";
import type { AssignmentStatus } from "@/types/api";

// The job workflow, same as the backend: ASSIGNED -> ACCEPTED -> IN_PROGRESS -> COMPLETED
const STEPS: AssignmentStatus[] = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

export function WorkflowSteps({ status }: { status: AssignmentStatus }) {
  const current = STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Job workflow">
      {STEPS.map((step, i) => {
        const done = i < current || status === "COMPLETED";
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
                done ? "bg-green-500 text-white" : isCurrent ? "bg-white/20" : "border",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className="font-medium">{ASSIGNMENT_STATUS[step].label}</span>
          </li>
        );
      })}
    </ol>
  );
}
