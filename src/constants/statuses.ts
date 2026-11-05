import type {
  Availability,
  OperationalStatus,
  OutageStatus,
  OutageType,
  Priority,
  ReportCategory,
} from "@/types";

// "Tone" decides the badge colour: green = good, amber = waiting, red = problem.
export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusInfo {
  label: string;
  tone: Tone;
}

export const OUTAGE_STATUS: Record<OutageStatus, StatusInfo> = {
  SCHEDULED: { label: "Scheduled", tone: "info" },
  ACTIVE: { label: "Active", tone: "danger" },
  COMPLETED: { label: "Completed", tone: "success" },
  REPORTED: { label: "Reported", tone: "warning" },
  ASSIGNED: { label: "Assigned", tone: "info" },
  IN_PROGRESS: { label: "In Progress", tone: "warning" },
  REPAIR_COMPLETED: { label: "Repair Completed", tone: "info" },
  RESTORED: { label: "Restored", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const OUTAGE_TYPE: Record<OutageType, StatusInfo> = {
  SCHEDULED: { label: "Scheduled", tone: "info" },
  UNEXPECTED: { label: "Unexpected", tone: "danger" },
};

export const PRIORITY: Record<Priority, StatusInfo> = {
  LOW: { label: "Low", tone: "neutral" },
  MEDIUM: { label: "Medium", tone: "info" },
  HIGH: { label: "High", tone: "warning" },
  CRITICAL: { label: "Critical", tone: "danger" },
};

export const OPERATIONAL_STATUS: Record<OperationalStatus, StatusInfo> = {
  OPERATIONAL: { label: "Operational", tone: "success" },
  MAINTENANCE: { label: "Maintenance", tone: "warning" },
  OFFLINE: { label: "Offline", tone: "danger" },
};

export const AVAILABILITY: Record<Availability, StatusInfo> = {
  AVAILABLE: { label: "Available", tone: "success" },
  BUSY: { label: "Busy", tone: "warning" },
  OFF_DUTY: { label: "Off duty", tone: "neutral" },
};

export const REPORT_CATEGORY_LABEL: Record<ReportCategory, string> = {
  NO_POWER: "No power at all",
  PARTIAL_POWER: "Partial power loss",
  VOLTAGE_FLUCTUATION: "Voltage fluctuation",
  DAMAGED_LINE: "Damaged power line",
  TRANSFORMER_PROBLEM: "Transformer problem",
  OTHER: "Other",
};

// Statuses an outage passes through, in order, for the progress timeline.
export const REPAIR_STEPS: OutageStatus[] = [
  "REPORTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "REPAIR_COMPLETED",
  "RESTORED",
];

// Statuses that mean the outage is still affecting customers.
export const OPEN_STATUSES: OutageStatus[] = [
  "ACTIVE",
  "REPORTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "REPAIR_COMPLETED",
];

// Used to sort jobs: most urgent first.
export const PRIORITY_ORDER: Record<Priority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

// The four steps a technician moves a job through.
export const TECHNICIAN_STEPS: OutageStatus[] = ["ASSIGNED", "IN_PROGRESS", "REPAIR_COMPLETED", "RESTORED"];
