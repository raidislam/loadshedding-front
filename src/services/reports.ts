import { delay } from "@/lib/delay";
import { nextId } from "@/lib/ids";
import { addActivity, areasStore, reportsStore } from "@/services/store";
import type { OutageReport, ReportCategory } from "@/types";

export interface ReportInput {
  customerId: string;
  areaId: string;
  category: ReportCategory;
  location: string;
  description: string;
  problemStart: string;
  imageName?: string;
  contactName: string;
  contactPhone: string;
}

function newestFirst(list: OutageReport[]) {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Admin: every report.
export async function getReports(): Promise<OutageReport[]> {
  await delay();
  return newestFirst(reportsStore.load());
}

// Customer: only their own reports.
export async function getCustomerReports(customerId: string): Promise<OutageReport[]> {
  await delay();
  return newestFirst(reportsStore.load().filter((r) => r.customerId === customerId));
}

export async function getReportById(id: string): Promise<OutageReport | undefined> {
  await delay(250);
  return reportsStore.load().find((r) => r.id === id);
}

// Customer submits a new report. It always starts as REPORTED.
export async function createOutageReport(input: ReportInput): Promise<OutageReport> {
  await delay(800);
  const list = reportsStore.load();
  const now = new Date().toISOString();
  const report: OutageReport = {
    ...input,
    id: nextId("REP", list.map((r) => r.id)),
    status: "REPORTED",
    createdAt: now,
    timeline: [{ status: "REPORTED", at: now, note: "Report submitted by customer." }],
  };
  reportsStore.save([report, ...list]);
  const areaName = areasStore.load().find((a) => a.id === input.areaId)?.name ?? "an area";
  addActivity(`New customer report ${report.id} received from ${areaName}`);
  return report;
}
