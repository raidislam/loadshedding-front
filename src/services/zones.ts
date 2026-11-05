import { delay } from "@/lib/delay";
import { nextId } from "@/lib/ids";
import { addActivity, substationsStore, zonesStore } from "@/services/store";
import type { Zone } from "@/types";

export type ZoneInput = Omit<Zone, "id" | "createdAt">;

export async function getZones(): Promise<Zone[]> {
  await delay();
  return zonesStore.load();
}

export async function getZoneById(id: string): Promise<Zone | undefined> {
  await delay(250);
  return zonesStore.load().find((z) => z.id === id);
}

export async function createZone(input: ZoneInput): Promise<Zone> {
  await delay(600);
  const list = zonesStore.load();
  const zone: Zone = {
    ...input,
    id: nextId("zone", list.map((z) => z.id)),
    createdAt: new Date().toISOString(),
  };
  zonesStore.save([...list, zone]);
  addActivity(`Zone "${zone.name}" was created`);
  return zone;
}

export async function updateZone(id: string, input: ZoneInput): Promise<Zone> {
  await delay(600);
  const list = zonesStore.load();
  const index = list.findIndex((z) => z.id === id);
  if (index === -1) throw new Error("Zone not found.");
  list[index] = { ...list[index], ...input };
  zonesStore.save(list);
  addActivity(`Zone "${input.name}" was updated`);
  return list[index];
}

export async function deleteZone(id: string): Promise<void> {
  await delay(500);
  if (substationsStore.load().some((s) => s.zoneId === id)) {
    throw new Error("This zone still has substations. Remove or move them first.");
  }
  const list = zonesStore.load();
  const zone = list.find((z) => z.id === id);
  zonesStore.save(list.filter((z) => z.id !== id));
  if (zone) addActivity(`Zone "${zone.name}" was deleted`);
}
