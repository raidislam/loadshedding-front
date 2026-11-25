import type {
  AssignmentStatus,
  BillStatus,
  NotificationType,
  OutageStatus,
  OutageType,
  PaymentStatus,
  ReportStatus,
  UserStatus,
} from "@/types/api";

// Label + badge colour for every status the backend returns.
// Usage: <StatusBadge {...OUTAGE_STATUS[outage.status]} />
// "Tone" decides the badge colour: green = good, amber = waiting, red = problem.
export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusInfo {
  label: string;
  tone: Tone;
}

export const OUTAGE_STATUS: Record<OutageStatus, StatusInfo> = {
  SCHEDULED: { label: "Scheduled", tone: "info" },
  ONGOING: { label: "Ongoing", tone: "danger" },
  RESOLVED: { label: "Resolved", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const OUTAGE_TYPE: Record<OutageType, StatusInfo> = {
  SCHEDULED: { label: "Scheduled", tone: "info" },
  UNEXPECTED: { label: "Unexpected", tone: "danger" },
};

export const REPORT_STATUS: Record<ReportStatus, StatusInfo> = {
  PENDING: { label: "Pending", tone: "warning" },
  UNDER_REVIEW: { label: "Under review", tone: "info" },
  ASSIGNED: { label: "Technician assigned", tone: "info" },
  IN_PROGRESS: { label: "Repair in progress", tone: "warning" },
  RESOLVED: { label: "Resolved", tone: "success" },
  REJECTED: { label: "Rejected", tone: "neutral" },
};

export const ASSIGNMENT_STATUS: Record<AssignmentStatus, StatusInfo> = {
  ASSIGNED: { label: "Assigned", tone: "info" },
  ACCEPTED: { label: "Accepted", tone: "info" },
  IN_PROGRESS: { label: "In progress", tone: "warning" },
  COMPLETED: { label: "Completed", tone: "success" },
};

export const BILL_STATUS: Record<BillStatus, StatusInfo> = {
  UNPAID: { label: "Unpaid", tone: "warning" },
  PAID: { label: "Paid", tone: "success" },
};

export const PAYMENT_STATUS: Record<PaymentStatus, StatusInfo> = {
  PENDING: { label: "Pending", tone: "warning" },
  SUCCESS: { label: "Success", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const USER_STATUS: Record<UserStatus, StatusInfo> = {
  ACTIVE: { label: "Active", tone: "success" },
  BLOCKED: { label: "Blocked", tone: "danger" },
};

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  SCHEDULED_OUTAGE: "Scheduled outage",
  OUTAGE_UPDATE: "Outage update",
  REPORT_UPDATE: "Report update",
  JOB_ASSIGNED: "New job",
  POWER_RESTORED: "Power restored",
  PAYMENT: "Payment",
  GENERAL: "General",
};

// Options for <SimpleSelect> / filter dropdowns
export const toOptions = (map: Record<string, StatusInfo>) =>
  Object.entries(map).map(([value, info]) => ({ value, label: info.label }));

// ---------- Audit log ----------

// Actions the backend writes to the audit log (used for the filter dropdown)
export const AUDIT_ACTIONS = [
  "OUTAGE_CREATED", "OUTAGE_UPDATED", "OUTAGE_STATUS_CHANGED", "OUTAGE_DELETED",
  "REPORT_CREATED", "REPORT_STATUS_CHANGED",
  "TECHNICIAN_ASSIGNED", "TECHNICIAN_REASSIGNED", "ASSIGNMENT_STATUS_CHANGED", "REPAIR_COMPLETED",
  "BILL_CREATED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_CANCELLED", "PAYMENT_VALIDATION_FAILED",
  "DUPLICATE_PAYMENT_NEEDS_REFUND",
  "TECHNICIAN_CREATED", "USER_ROLE_CHANGED", "USER_BLOCKED", "USER_UNBLOCKED",
];

export const AUDIT_ENTITY_TYPES = ["Outage", "OutageReport", "TechnicianAssignment", "Bill", "Payment", "User"];

// "OUTAGE_STATUS_CHANGED" -> "Outage status changed"
export function actionLabel(action: string) {
  const text = action.toLowerCase().replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
