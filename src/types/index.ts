// All shared TypeScript types for the project.
// IDs are plain strings. Related records point to each other through these IDs
// (for example an Area has a feederId), the same way a real database would.

export type Role = "ADMIN" | "CUSTOMER" | "TECHNICIAN";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // demo only - real passwords would never be stored like this
  phone: string;
  role: Role;
  address?: string;
  areaId?: string; // customers: their service area
  customerNumber?: string;
  createdAt: string;
  active: boolean;
}

// ---------- Infrastructure ----------

export type OperationalStatus = "OPERATIONAL" | "MAINTENANCE" | "OFFLINE";

export interface Zone {
  id: string;
  name: string;
  code: string;
  description: string;
  status: OperationalStatus;
  createdAt: string;
}

export interface Substation {
  id: string;
  name: string;
  code: string;
  zoneId: string;
  capacityMVA: number;
  status: OperationalStatus;
}

export interface Feeder {
  id: string;
  code: string;
  substationId: string;
  capacityMW: number;
  status: OperationalStatus;
}

export interface Area {
  id: string;
  name: string;
  code: string;
  zoneId: string;
  substationId: string;
  feederId: string;
  customerCount: number;
}

// ---------- Outages ----------

export type OutageType = "SCHEDULED" | "UNEXPECTED";

// SCHEDULED, ACTIVE, COMPLETED are used by scheduled outages.
// REPORTED ... RESTORED follow the unexpected-outage repair workflow.
export type OutageStatus =
  | "SCHEDULED"
  | "ACTIVE"
  | "COMPLETED"
  | "REPORTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "REPAIR_COMPLETED"
  | "RESTORED"
  | "CANCELLED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RepairNote {
  id: string;
  note: string;
  progress: number; // 0 - 100
  createdAt: string;
  author: string;
}

export interface Outage {
  id: string;
  type: OutageType;
  status: OutageStatus;
  priority: Priority;
  zoneId: string;
  substationId: string;
  feederId: string;
  areaId: string;
  startTime: string;
  expectedRestoration: string;
  restoredAt?: string;
  reason: string;
  description: string;
  reportId?: string; // unexpected outages start from a customer report
  technicianId?: string;
  assignedAt?: string;
  acceptedAt?: string; // technician accepted the assignment
  progress: number; // repair progress 0 - 100
  repairNotes: RepairNote[];
  evidenceFiles: string[]; // only file names - nothing is really uploaded
  completionSummary?: string;
  createdAt: string;
}

// ---------- Customer reports ----------

export type ReportCategory =
  | "NO_POWER"
  | "PARTIAL_POWER"
  | "VOLTAGE_FLUCTUATION"
  | "DAMAGED_LINE"
  | "TRANSFORMER_PROBLEM"
  | "OTHER";

export interface TimelineEntry {
  status: OutageStatus;
  at: string;
  note: string;
}

export interface OutageReport {
  id: string;
  customerId: string;
  areaId: string;
  category: ReportCategory;
  location: string;
  description: string;
  problemStart: string;
  imageName?: string;
  contactName: string;
  contactPhone: string;
  status: OutageStatus;
  outageId?: string; // linked once admin reviews the report
  technicianId?: string;
  estimatedRestoration?: string;
  createdAt: string;
  timeline: TimelineEntry[];
}

// ---------- Technicians ----------

export type Availability = "AVAILABLE" | "BUSY" | "OFF_DUTY";

export interface Technician {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  zoneId: string;
  availability: Availability;
  specialty: string;
  employeeId: string;
}

// ---------- Notifications & activity ----------

export type NotificationType =
  | "SCHEDULED_OUTAGE"
  | "UNEXPECTED_OUTAGE"
  | "ASSIGNMENT"
  | "RESTORATION";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  message: string;
  createdAt: string;
}

// ---------- Dashboard / analytics ----------

export interface MonthlyOutageStat {
  month: string;
  scheduled: number;
  unexpected: number;
}

export interface ZoneOutageStat {
  zone: string;
  outages: number;
}

export interface DashboardStats {
  totalZones: number;
  totalSubstations: number;
  totalFeeders: number;
  totalAreas: number;
  activeOutages: number;
  scheduledOutages: number;
  pendingReports: number;
  availableTechnicians: number;
}
