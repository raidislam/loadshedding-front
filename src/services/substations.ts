import { delay } from "@/lib/delay";
import { nextId } from "@/lib/ids";
import { addActivity, feedersStore, substationsStore } from "@/services/store";
import type { Substation } from "@/types";

export type SubstationInput = Omit<Substation, "id">;

export async function getSubstations(): Promise<Substation[]> {
  await delay();
  return substationsStore.load();
}

export async function getSubstationById(id: string): Promise<Substation | undefined> {
  await delay(250);
  return substationsStore.load().find((s) => s.id === id);
}

export async function createSubstation(input: SubstationInput): Promise<Substation> {
  await delay(600);
  const list = substationsStore.load();
  const item: Substation = { ...input, id: nextId("sub", list.map((s) => s.id)) };
  substationsStore.save([...list, item]);
  addActivity(`Substation "${item.name}" was created`);
  return item;
}

export async function updateSubstation(id: string, input: SubstationInput): Promise<Substation> {
  await delay(600);
  const list = substationsStore.load();
  const index = list.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Substation not found.");
  list[index] = { ...list[index], ...input };
  substationsStore.save(list);
  addActivity(`Substation "${input.name}" was updated`);
  return list[index];
}

export async function deleteSubstation(id: string): Promise<void> {
  await delay(500);
  if (feedersStore.load().some((f) => f.substationId === id)) {
    throw new Error("This substation still has feeders. Remove them first.");
  }
  const list = substationsStore.load();
  const item = list.find((s) => s.id === id);
  substationsStore.save(list.filter((s) => s.id !== id));
  if (item) addActivity(`Substation "${item.name}" was deleted`);
}
