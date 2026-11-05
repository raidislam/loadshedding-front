import { delay } from "@/lib/delay";
import { OPEN_STATUSES } from "@/constants/statuses";
import { monthlyOutageStats } from "@/mock-data/analytics";
import {
  activityStore,
  areasStore,
  feedersStore,
  outagesStore,
  reportsStore,
  substationsStore,
  techniciansStore,
  zonesStore,
} from "@/services/store";
import type {
  ActivityLog,
  DashboardStats,
  MonthlyOutageStat,
  ZoneOutageStat,
} from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay();
  const outages = outagesStore.load();
  return {
    totalZones: zonesStore.load().length,
    totalSubstations: substationsStore.load().length,
    totalFeeders: feedersStore.load().length,
    totalAreas: areasStore.load().length,
    activeOutages: outages.filter((o) => OPEN_STATUSES.includes(o.status)).length,
    scheduledOutages: outages.filter((o) => o.status === "SCHEDULED").length,
    pendingReports: reportsStore.load().filter((r) => r.status === "REPORTED").length,
    availableTechnicians: techniciansStore.load().filter((t) => t.availability === "AVAILABLE").length,
  };
}

export async function getMonthlyOutageStats(): Promise<MonthlyOutageStat[]> {
  await delay();
  return monthlyOutageStats;
}

// Scheduled vs unexpected, counted from the current outage list.
export async function getOutageTypeStats(): Promise<{ name: string; value: number }[]> {
  await delay();
  const outages = outagesStore.load();
  return [
    { name: "Scheduled", value: outages.filter((o) => o.type === "SCHEDULED").length },
    { name: "Unexpected", value: outages.filter((o) => o.type === "UNEXPECTED").length },
  ];
}

export async function getZoneOutageStats(): Promise<ZoneOutageStat[]> {
  await delay();
  const outages = outagesStore.load();
  return zonesStore.load().map((zone) => ({
    zone: zone.name,
    outages: outages.filter((o) => o.zoneId === zone.id).length,
  }));
}

export async function getRecentActivities(): Promise<ActivityLog[]> {
  await delay(300);
  return activityStore.load().slice(0, 8);
}
