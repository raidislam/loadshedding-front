// Types that match the backend API (https://loadsheeding-backend.vercel.app/api/v1).
// Dates come from the API as ISO strings.

export type Role = "ADMIN" | "CUSTOMER" | "TECHNICIAN";
export type UserStatus = "ACTIVE" | "BLOCKED";
export type OutageType = "SCHEDULED" | "UNEXPECTED";
export type OutageStatus = "SCHEDULED" | "ONGOING" | "RESOLVED" | "CANCELLED";
export type ReportStatus = "PENDING" | "UNDER_REVIEW" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
export type AssignmentStatus = "ASSIGNED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED";
export type NotificationType =
  | "SCHEDULED_OUTAGE"
  | "OUTAGE_UPDATE"
  | "REPORT_UPDATE"
  | "JOB_ASSIGNED"
  | "POWER_RESTORED"
  | "PAYMENT"
  | "GENERAL";
export type BillStatus = "UNPAID" | "PAID";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

// ---------- API envelope ----------

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount?: number;
}

export interface ApiFieldError {
  path: string;
  message: string;
}

// ---------- Network ----------

export interface ZoneRef {
  id: string;
  name: string;
  code: string;
}

export interface Zone extends ZoneRef {
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { substations: number };
  substations?: { id: string; name: string; code: string; capacityMW: number | null }[];
}

export interface Substation {
  id: string;
  name: string;
  code: string;
  capacityMW: number | null;
  address: string | null;
  zoneId: string;
  zone?: ZoneRef;
  createdAt: string;
  _count?: { feeders: number };
  feeders?: { id: string; name: string; code: string; voltageKV: number | null }[];
}

export interface Feeder {
  id: string;
  name: string;
  code: string;
  voltageKV: number | null;
  substationId: string;
  substation?: ZoneRef & { zone: ZoneRef };
  createdAt: string;
  _count?: { areas: number };
  areas?: { id: string; name: string; code: string }[];
}

// area -> feeder -> substation -> zone
export interface AreaPath extends ZoneRef {
  feeder: ZoneRef & { substation: ZoneRef & { zone: ZoneRef } };
}

export interface Area extends AreaPath {
  feederId: string;
  createdAt: string;
  _count?: { customers: number; outages: number };
}

// ---------- Users ----------

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: Role;
  status: UserStatus;
  meterNumber: string | null;
  areaId: string | null;
  area?: AreaPath | ZoneRef | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- Outages ----------

export interface Outage {
  id: string;
  title: string;
  type: OutageType;
  status: OutageStatus;
  reason: string;
  description: string | null;
  startTime: string;
  expectedRestoreTime: string;
  actualRestoreTime: string | null;
  areaId: string;
  area: AreaPath;
  createdAt: string;
  updatedAt: string;
  _count?: { reports: number };
  notifiedCustomers?: number;
}

// ---------- Reports, assignments, repairs ----------

export interface RepairRecord {
  id: string;
  workDescription: string;
  partsUsed: string | null;
  restoredAt: string;
  assignmentId: string;
  createdAt: string;
}

export interface PersonRef {
  id: string;
  name: string;
  phone: string | null;
  email?: string;
}

export interface OutageReport {
  id: string;
  title: string;
  description: string;
  address: string | null;
  status: ReportStatus;
  adminNote: string | null;
  restoredAt: string | null;
  customerId: string;
  areaId: string;
  outageId: string | null;
  createdAt: string;
  updatedAt: string;
  area: AreaPath;
  customer?: PersonRef & { meterNumber?: string | null };
  outage?: Pick<Outage, "id" | "title" | "type" | "status" | "startTime" | "expectedRestoreTime"> | null;
  assignment?: {
    id: string;
    status: AssignmentStatus;
    technician: PersonRef;
    repairRecords?: RepairRecord[];
  } | null;
}

export interface Assignment {
  id: string;
  status: AssignmentStatus;
  note: string | null;
  assignedAt: string;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  reportId: string;
  technicianId: string;
  report: {
    id: string;
    title: string;
    description: string;
    address: string | null;
    status: ReportStatus;
    createdAt: string;
    area: AreaPath;
    customer: PersonRef;
  };
  technician: PersonRef;
  assignedBy: { id: string; name: string };
  repairRecords: RepairRecord[];
  outageResolved?: boolean;
}

// ---------- Notifications ----------

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

// ---------- Bills & payments ----------

export interface Bill {
  id: string;
  billMonth: string;
  unitsConsumed: number;
  amount: string; // Decimal comes as a string, e.g. "725.5"
  dueDate: string;
  status: BillStatus;
  paidAt: string | null;
  customerId: string;
  createdAt: string;
  customer?: { id: string; name: string; email: string; meterNumber: string | null };
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  bankTransactionId: string | null;
  cardType: string | null;
  paidAt: string | null;
  createdAt: string;
  bill: { id: string; billMonth: string; amount: string; status: BillStatus };
}

export interface InitiatePaymentResult {
  paymentId: string;
  transactionId: string;
  amount: number | string;
  gatewayUrl: string;
  reused: boolean;
}

// ---------- Admin ----------

export interface DashboardStats {
  users: Record<Role, number> & { total: number; blocked: number };
  network: { zones: number; substations: number; feeders: number; areas: number };
  outages: Record<OutageStatus, number> & { upcomingScheduled: number };
  reports: Record<ReportStatus, number> & { open: number };
  assignments: Record<AssignmentStatus, number>;
  payments: {
    successfulPayments: number;
    totalRevenue: number;
    thisMonthPayments: number;
    thisMonthRevenue: number;
    unpaidBills: number;
    unpaidAmount: number;
  };
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  userId: string | null;
  user: { id: string; name: string; email: string; role: Role } | null;
  createdAt: string;
}
