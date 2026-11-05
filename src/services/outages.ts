import { delay } from "@/lib/delay";
import { nextId } from "@/lib/ids";
import { REPORT_CATEGORY_LABEL, OPEN_STATUSES } from "@/constants/statuses";
import {
  addActivity,
  addNotification,
  areasStore,
  notifyArea,
  outagesStore,
  reportsStore,
  techniciansStore,
} from "@/services/store";
import type { Outage, OutageStatus, Priority } from "@/types";

function newestFirst(list: Outage[]) {
  return [...list].sort((a, b) => b.startTime.localeCompare(a.startTime));
}

export async function getOutages(): Promise<Outage[]> {
  await delay();
  return newestFirst(outagesStore.load());
}

export async function getOutageById(id: string): Promise<Outage | undefined> {
  await delay(250);
  return outagesStore.load().find((o) => o.id === id);
}

// Used by the customer dashboard: every outage that touches one area.
export async function getOutagesForArea(areaId: string): Promise<Outage[]> {
  await delay();
  return newestFirst(outagesStore.load().filter((o) => o.areaId === areaId));
}

// ---------- Scheduled outage ----------

export interface ScheduledOutageInput {
  zoneId: string;
  substationId: string;
  feederId: string;
  areaId: string;
  startTime: string;
  expectedRestoration: string;
  reason: string;
  description: string;
  notifyCustomers: boolean;
}

export async function createScheduledOutage(input: ScheduledOutageInput): Promise<Outage> {
  await delay(800);
  const list = outagesStore.load();
  const { notifyCustomers, ...fields } = input;
  const outage: Outage = {
    ...fields,
    id: nextId("OUT", list.map((o) => o.id)),
    type: "SCHEDULED",
    status: "SCHEDULED",
    priority: "LOW",
    progress: 0,
    repairNotes: [],
    evidenceFiles: [],
    createdAt: new Date().toISOString(),
  };
  outagesStore.save([outage, ...list]);

  const areaName = areasStore.load().find((a) => a.id === input.areaId)?.name ?? "your area";
  addActivity(`Scheduled outage ${outage.id} created for ${areaName}`);
  if (notifyCustomers) {
    notifyArea(
      input.areaId,
      "SCHEDULED_OUTAGE",
      `${input.reason} scheduled in ${areaName}`,
      `Power will be off in ${areaName}. Please plan ahead. ${input.description}`,
    );
  }
  return outage;
}

// ---------- Unexpected outage workflow ----------

export interface AssignInput {
  reportId: string;
  technicianId: string;
  priority: Priority;
  estimatedHours: number;
}

// Admin reviews a REPORTED report, creates the outage and assigns a technician.
export async function assignTechnician(input: AssignInput): Promise<Outage> {
  await delay(800);
  const reports = reportsStore.load();
  const report = reports.find((r) => r.id === input.reportId);
  if (!report) throw new Error("Report not found.");
  if (report.outageId) throw new Error("This report already has a technician.");

  const technicians = techniciansStore.load();
  const technician = technicians.find((t) => t.id === input.technicianId);
  if (!technician) throw new Error("Technician not found.");

  const area = areasStore.load().find((a) => a.id === report.areaId);
  if (!area) throw new Error("Area not found.");

  const outages = outagesStore.load();
  const now = new Date();
  const estimated = new Date(now.getTime() + input.estimatedHours * 3_600_000).toISOString();

  const outage: Outage = {
    id: nextId("OUT", outages.map((o) => o.id)),
    type: "UNEXPECTED",
    status: "ASSIGNED",
    priority: input.priority,
    zoneId: area.zoneId,
    substationId: area.substationId,
    feederId: area.feederId,
    areaId: area.id,
    startTime: report.problemStart,
    expectedRestoration: estimated,
    reason: REPORT_CATEGORY_LABEL[report.category],
    description: report.description,
    reportId: report.id,
    technicianId: technician.id,
    assignedAt: now.toISOString(),
    progress: 0,
    repairNotes: [],
    evidenceFiles: [],
    createdAt: now.toISOString(),
  };
  outagesStore.save([outage, ...outages]);

  report.status = "ASSIGNED";
  report.outageId = outage.id;
  report.technicianId = technician.id;
  report.estimatedRestoration = estimated;
  report.timeline.push({
    status: "ASSIGNED",
    at: now.toISOString(),
    note: `Technician ${technician.name} assigned.`,
  });
  reportsStore.save(reports);

  technician.availability = "BUSY";
  techniciansStore.save(technicians);

  addActivity(`Technician ${technician.name} assigned to ${outage.id}`);
  addNotification(
    report.customerId,
    "ASSIGNMENT",
    "Technician assigned to your report",
    `${technician.name} has been assigned to report ${report.id}.`,
  );
  notifyArea(
    area.id,
    "UNEXPECTED_OUTAGE",
    `Power outage in ${area.name}`,
    "An unexpected outage is affecting your area. A repair team is on the way.",
    report.customerId,
  );
  return outage;
}

// Central place where an outage changes status. Everything that must happen
// together (report timeline, technician availability, notifications) is here.
export function applyOutageStatus(outageId: string, status: OutageStatus, note?: string): Outage {
  const outages = outagesStore.load();
  const outage = outages.find((o) => o.id === outageId);
  if (!outage) throw new Error("Outage not found.");

  const now = new Date().toISOString();
  outage.status = status;
  if (status === "RESTORED" || status === "COMPLETED") {
    outage.restoredAt = now;
    outage.progress = 100;
  }
  if (status === "REPAIR_COMPLETED") outage.progress = 100;
  if (status === "IN_PROGRESS" && outage.progress === 0) outage.progress = 10;
  outagesStore.save(outages);

  // Keep the customer report in sync
  if (outage.reportId) {
    const reports = reportsStore.load();
    const report = reports.find((r) => r.id === outage.reportId);
    if (report) {
      report.status = status;
      report.timeline.push({ status, at: now, note: note ?? `Status changed to ${status}.` });
      if (status === "RESTORED") report.estimatedRestoration = now;
      reportsStore.save(reports);

      if (status === "IN_PROGRESS") {
        addNotification(report.customerId, "ASSIGNMENT", "Repair work has started",
          `The technician has started working on report ${report.id}.`);
      }
      if (status === "REPAIR_COMPLETED") {
        addNotification(report.customerId, "RESTORATION", "Repair completed",
          `The repair for report ${report.id} is complete. Power will be confirmed shortly.`);
      }
    }
  }

  // Technician becomes available again when no open jobs are left
  if (outage.technicianId && (status === "REPAIR_COMPLETED" || status === "RESTORED" || status === "CANCELLED")) {
    const technicians = techniciansStore.load();
    const tech = technicians.find((t) => t.id === outage.technicianId);
    const stillBusy = outages.some(
      (o) => o.technicianId === outage.technicianId && ["ASSIGNED", "IN_PROGRESS"].includes(o.status),
    );
    if (tech && !stillBusy && tech.availability === "BUSY") {
      tech.availability = "AVAILABLE";
      techniciansStore.save(technicians);
    }
  }

  const areaName = areasStore.load().find((a) => a.id === outage.areaId)?.name ?? "your area";
  if (status === "RESTORED") {
    notifyArea(outage.areaId, "RESTORATION", `Power restored in ${areaName}`,
      "Power has been restored. Thank you for your patience.");
  }
  addActivity(`Outage ${outage.id} status changed to ${status.replaceAll("_", " ").toLowerCase()}`);
  return outage;
}

export async function updateOutageStatus(outageId: string, status: OutageStatus, note?: string): Promise<Outage> {
  await delay(600);
  return applyOutageStatus(outageId, status, note);
}

export async function cancelOutage(outageId: string): Promise<Outage> {
  return updateOutageStatus(outageId, "CANCELLED", "Outage cancelled by admin.");
}

export function isOpenOutage(outage: Outage): boolean {
  return OPEN_STATUSES.includes(outage.status);
}
