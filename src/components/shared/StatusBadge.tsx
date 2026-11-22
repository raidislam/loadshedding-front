import { Badge } from "@/components/ui/badge";
import type { Tone } from "@/constants/statuses";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  info: "bg-blue-100 text-blue-800 dark:bg-sky-500/15 dark:text-sky-300",
  neutral: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
};

interface StatusBadgeProps {
  label: string;
  tone: Tone;
  className?: string;
}

// One badge used for every status in the app (outage, priority, availability...).
// Usage: <StatusBadge {...OUTAGE_STATUS[outage.status]} />
export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", TONE_CLASS[tone], className)}
    >
      {label}
    </Badge>
  );
}
