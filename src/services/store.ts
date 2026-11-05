// Low-level demo storage. Every collection starts from the seed data in
// mock-data/ and is saved to localStorage after the first change.
// These functions are synchronous and have no delay - the public services
// (zones.ts, outages.ts ...) wrap them with async + delay like real API calls.
// When a real backend exists, only the services need to change.

import { readStorage, removeStorage, writeStorage } from "@/lib/storage";
import { nextId } from "@/lib/ids";
import { areas } from "@/mock-data/areas";
import { feeders } from "@/mock-data/feeders";
import { activities, notifications } from "@/mock-data/notifications";
import { outages } from "@/mock-data/outages";
import { reports } from "@/mock-data/reports";
import { substations } from "@/mock-data/substations";
import { technicians } from "@/mock-data/technicians";
import { zones } from "@/mock-data/zones";
import { getAllUsers } from "@/services/auth";
import type {
  ActivityLog,
  Area,
  Feeder,
  Notification,
  NotificationType,
  Outage,
  OutageReport,
  Substation,
  Technician,
  Zone,
} from "@/types";

function collection<T>(key: string, seed: T[]) {
  return {
    key,
    // structuredClone so changing a loaded item never edits the seed arrays
    load: (): T[] => readStorage<T[] | null>(key, null) ?? structuredClone(seed),
    save: (list: T[]) => writeStorage(key, list),
  };
}

export const zonesStore = collection<Zone>("ls_zones", zones);
export const substationsStore = collection<Substation>("ls_substations", substations);
export const feedersStore = collection<Feeder>("ls_feeders", feeders);
export const areasStore = collection<Area>("ls_areas", areas);
export const outagesStore = collection<Outage>("ls_outages", outages);
export const reportsStore = collection<OutageReport>("ls_reports", reports);
export const techniciansStore = collection<Technician>("ls_technicians", technicians);
export const notificationsStore = collection<Notification>("ls_notifications", notifications);
export const activityStore = collection<ActivityLog>("ls_activity", activities);

const ALL_KEYS = [
  zonesStore, substationsStore, feedersStore, areasStore, outagesStore,
  reportsStore, techniciansStore, notificationsStore, activityStore,
].map((c) => c.key);

// Used by Settings -> "Reset demo data". Also removes registered users.
export function resetDemoData() {
  [...ALL_KEYS, "ls_users"].forEach(removeStorage);
}

// ---------- helpers used by several services ----------

export function addActivity(message: string) {
  const list = activityStore.load();
  list.unshift({
    id: nextId("act", list.map((a) => a.id)),
    message,
    createdAt: new Date().toISOString(),
  });
  activityStore.save(list.slice(0, 30));
}

export function addNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
) {
  const list = notificationsStore.load();
  list.unshift({
    id: `notif-${Date.now()}-${list.length}`,
    userId,
    type,
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  });
  notificationsStore.save(list);
}

// Sends one notification to every customer living in an area.
export function notifyArea(
  areaId: string,
  type: NotificationType,
  title: string,
  message: string,
  exceptUserId?: string,
) {
  getAllUsers()
    .filter((u) => u.role === "CUSTOMER" && u.areaId === areaId && u.id !== exceptUserId)
    .forEach((u) => addNotification(u.id, type, title, message));
}
