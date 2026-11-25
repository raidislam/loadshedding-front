import "server-only";
import { cacheLife } from "next/cache";
import { BACKEND_URL } from "@/lib/server/backend";
import type { Area, Meta, Zone } from "@/types/api";

// Public (no login) data fetched by Server Components.

type Query = Record<string, string | number | undefined>;

const buildUrl = (path: string, query: Query = {}) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const text = params.toString();
  return `${BACKEND_URL}${path}${text ? `?${text}` : ""}`;
};

// Always fresh (e.g. the outage list must show the latest status)
export async function fetchPublic<T>(path: string, query?: Query): Promise<{ data: T; meta?: Meta }> {
  const res = await fetch(buildUrl(path, query), { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? "Could not load data from the server.");
  }
  return { data: json.data as T, meta: json.meta as Meta | undefined };
}

// Zones and areas change rarely, so they are cached for a few minutes ("use cache").
export async function getZoneAndAreaOptions() {
  "use cache";
  cacheLife("minutes");

  const [zones, areas] = await Promise.all([
    fetchPublic<Zone[]>("/zones", { limit: 100, sortBy: "name", sortOrder: "asc" }),
    fetchPublic<Area[]>("/areas", { limit: 100, sortBy: "name", sortOrder: "asc" }),
  ]);
  return { zones: zones.data, areas: areas.data };
}

// Counts for the home page ("meta.total" of each list)
export async function getNetworkCounts() {
  "use cache";
  cacheLife("minutes");

  const total = async (path: string) => (await fetchPublic<unknown[]>(path, { limit: 1 })).meta?.total ?? 0;
  const [zones, substations, feeders, areas] = await Promise.all([
    total("/zones"),
    total("/substations"),
    total("/feeders"),
    total("/areas"),
  ]);
  return { zones, substations, feeders, areas };
}
