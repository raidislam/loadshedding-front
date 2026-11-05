import { AlertTriangle, CalendarClock, CheckCircle2, Wrench, type LucideIcon } from "lucide-react";
import type { NotificationType } from "@/types";

export const NOTIFICATION_TYPE: Record<NotificationType, { label: string; icon: LucideIcon; className: string }> = {
  SCHEDULED_OUTAGE: { label: "Scheduled outage", icon: CalendarClock, className: "bg-blue-100 text-blue-700" },
  UNEXPECTED_OUTAGE: { label: "Unexpected outage", icon: AlertTriangle, className: "bg-red-100 text-red-700" },
  ASSIGNMENT: { label: "Repair update", icon: Wrench, className: "bg-amber-100 text-amber-700" },
  RESTORATION: { label: "Power restored", icon: CheckCircle2, className: "bg-green-100 text-green-700" },
};
