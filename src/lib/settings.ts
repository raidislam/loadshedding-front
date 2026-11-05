import { readStorage, writeStorage } from "@/lib/storage";

// Admin preferences. They are really used: the outage wizard and the
// assign-technician form read these values as their defaults.
export interface AppSettings {
  notifyByDefault: boolean; // tick "notify customers" when scheduling an outage
  defaultRepairHours: number; // pre-filled estimate when assigning a technician
}

const KEY = "ls_settings";
const DEFAULTS: AppSettings = { notifyByDefault: true, defaultRepairHours: 4 };

export function getSettings(): AppSettings {
  return { ...DEFAULTS, ...readStorage<Partial<AppSettings>>(KEY, {}) };
}

export function saveSettings(settings: AppSettings) {
  writeStorage(KEY, settings);
}
