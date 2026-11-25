"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Query = Record<string, string | number | undefined>;

// GET a paginated list, e.g. useList<Zone>("zones", { page: 1, searchTerm: "dhaka" })
// The query key contains the filters, so changing a filter fetches the new page.
// keepPreviousData keeps the old rows on screen while the next page loads.
export function useList<T>(resource: string, query: Query = {}) {
  return useQuery({
    queryKey: [resource, "list", query],
    queryFn: () => api<T[]>(`/${resource}`, { query }),
    placeholderData: keepPreviousData,
  });
}

// GET one item, e.g. useDetail<Zone>("zones", id)
export function useDetail<T>(resource: string, id: string) {
  return useQuery({
    queryKey: [resource, "detail", id],
    queryFn: async () => (await api<T>(`/${resource}/${id}`)).data,
    enabled: !!id,
  });
}

// Up to 100 items for a dropdown (zones, substations, feeders, areas, technicians...)
export function useOptions<T>(resource: string, query: Query = {}, enabled = true) {
  return useQuery({
    queryKey: [resource, "options", query],
    queryFn: async () => (await api<T[]>(`/${resource}`, { query: { limit: 100, ...query } })).data,
    enabled,
  });
}
