import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/types/api";

// Icon + colour for each notification type sent by the backend
export const NOTIFICATION_TYPE: Record<NotificationType, { label: string; icon: LucideIcon; className: string }> = {
  SCHEDULED_OUTAGE: { label: "Scheduled outage", icon: CalendarClock, className: "bg-blue-100 text-blue-700" },
  OUTAGE_UPDATE: { label: "Outage update", icon: AlertTriangle, className: "bg-red-100 text-red-700" },
  REPORT_UPDATE: { label: "Report update", icon: FileText, className: "bg-amber-100 text-amber-700" },
  JOB_ASSIGNED: { label: "New job", icon: Wrench, className: "bg-violet-100 text-violet-700" },
  POWER_RESTORED: { label: "Power restored", icon: CheckCircle2, className: "bg-green-100 text-green-700" },
  PAYMENT: { label: "Payment", icon: CreditCard, className: "bg-emerald-100 text-emerald-700" },
  GENERAL: { label: "General", icon: Bell, className: "bg-slate-100 text-slate-700" },
};
