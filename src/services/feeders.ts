import { delay } from "@/lib/delay";
import { nextId } from "@/lib/ids";
import { addActivity, areasStore, feedersStore } from "@/services/store";
import type { Feeder } from "@/types";

export type FeederInput = Omit<Feeder, "id">;

export async function getFeeders(): Promise<Feeder[]> {
  await delay();
  return feedersStore.load();
}

export async function getFeederById(id: string): Promise<Feeder | undefined> {
  await delay(250);
  return feedersStore.load().find((f) => f.id === id);
}

export async function createFeeder(input: FeederInput): Promise<Feeder> {
  await delay(600);
  const list = feedersStore.load();
  const item: Feeder = { ...input, id: nextId("fdr", list.map((f) => f.id)) };
  feedersStore.save([...list, item]);
  addActivity(`Feeder ${item.code} was created`);
  return item;
}

export async function updateFeeder(id: string, input: FeederInput): Promise<Feeder> {
  await delay(600);
  const list = feedersStore.load();
  const index = list.findIndex((f) => f.id === id);
  if (index === -1) throw new Error("Feeder not found.");
  list[index] = { ...list[index], ...input };
  feedersStore.save(list);
  addActivity(`Feeder ${input.code} was updated`);
  return list[index];
}

export async function deleteFeeder(id: string): Promise<void> {
  await delay(500);
  if (areasStore.load().some((a) => a.feederId === id)) {
    throw new Error("This feeder still has connected areas. Remove them first.");
  }
  const list = feedersStore.load();
  const item = list.find((f) => f.id === id);
  feedersStore.save(list.filter((f) => f.id !== id));
  if (item) addActivity(`Feeder ${item.code} was deleted`);
}
