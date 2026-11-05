import { delay } from "@/lib/delay";
import { nextId } from "@/lib/ids";
import { addActivity, areasStore } from "@/services/store";
import type { Area } from "@/types";

export type AreaInput = Omit<Area, "id">;

export async function getAreas(): Promise<Area[]> {
  await delay();
  return areasStore.load();
}

export async function getAreaById(id: string): Promise<Area | undefined> {
  await delay(250);
  return areasStore.load().find((a) => a.id === id);
}

export async function createArea(input: AreaInput): Promise<Area> {
  await delay(600);
  const list = areasStore.load();
  const item: Area = { ...input, id: nextId("area", list.map((a) => a.id)) };
  areasStore.save([...list, item]);
  addActivity(`Area "${item.name}" was created`);
  return item;
}

export async function updateArea(id: string, input: AreaInput): Promise<Area> {
  await delay(600);
  const list = areasStore.load();
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) throw new Error("Area not found.");
  list[index] = { ...list[index], ...input };
  areasStore.save(list);
  addActivity(`Area "${input.name}" was updated`);
  return list[index];
}

export async function deleteArea(id: string): Promise<void> {
  await delay(500);
  const list = areasStore.load();
  const item = list.find((a) => a.id === id);
  areasStore.save(list.filter((a) => a.id !== id));
  if (item) addActivity(`Area "${item.name}" was deleted`);
}
