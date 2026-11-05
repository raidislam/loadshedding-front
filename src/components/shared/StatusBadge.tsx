import { Badge } from "@/components/ui/badge";
import type { Tone } from "@/constants/statuses";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-slate-100 text-slate-700",
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
