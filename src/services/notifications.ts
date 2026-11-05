import { delay } from "@/lib/delay";
import { notificationsStore } from "@/services/store";
import type { Notification } from "@/types";

// Lets the header bell refresh its unread count after a change.
export const NOTIFICATIONS_CHANGED = "ls:notifications-changed";
function announceChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  await delay(300);
  return notificationsStore
    .load()
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(150);
  const list = notificationsStore.load();
  const item = list.find((n) => n.id === id);
  if (item) item.read = true;
  notificationsStore.save(list);
  announceChange();
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await delay(250);
  const list = notificationsStore.load();
  list.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  notificationsStore.save(list);
  announceChange();
}
