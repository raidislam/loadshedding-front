"use client";

import { Activity, CalendarClock, MapPinned } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { OPEN_STATUSES, OUTAGE_STATUS, OUTAGE_TYPE } from "@/constants/statuses";
import { useLoad } from "@/hooks/useLoad";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatDateTime } from "@/lib/format";
import { paginate } from "@/lib/paginate";
import { getAreas } from "@/services/areas";
import { getOutages } from "@/services/outages";
import { getZones } from "@/services/zones";
import type { Outage } from "@/types";

async function loadBoard() {
  const [outages, zones, areas] = await Promise.all([getOutages(), getZones(), getAreas()]);
  return { outages, zones, areas };
}

// "2026-11-05" in local time, used for the date filter
function localDay(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE");
}

export function OutageStatusBoard() {
  const { data, error, loading } = useLoad(loadBoard);
  const { get, page } = useUrlFilters();

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">{error}</div>
    );
  }

  const zones = data?.zones ?? [];
  const areas = data?.areas ?? [];
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? "-";
  const areaName = (id: string) => areas.find((a) => a.id === id)?.name ?? "-";

  // Public page shows only outages that are happening now or planned for later
  const current = (data?.outages ?? []).filter(
    (o) => o.status === "SCHEDULED" || OPEN_STATUSES.includes(o.status),
  );

  const zoneFilter = get("zone");
  const areaFilter = get("area");
  const typeFilter = get("type");
  const dateFilter = get("date");

  const filtered = current
    .filter((o) => !zoneFilter || o.zoneId === zoneFilter)
    .filter((o) => !areaFilter || o.areaId === areaFilter)
    .filter((o) => !typeFilter || o.type === typeFilter)
    .filter(
      (o) =>
        !dateFilter ||
        (localDay(o.startTime) <= dateFilter && dateFilter <= localDay(o.expectedRestoration)),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const paged = paginate(filtered, page);

  const columns: Column<Outage>[] = [
    {
      header: "Affected area",
      cell: (o) => (
        <div>
          <p className="font-medium">{areaName(o.areaId)}</p>
          <p className="text-xs text-muted-foreground">{zoneName(o.zoneId)}</p>
        </div>
      ),
    },
    { header: "Type", cell: (o) => <StatusBadge {...OUTAGE_TYPE[o.type]} /> },
    { header: "Status", cell: (o) => <StatusBadge {...OUTAGE_STATUS[o.status]} /> },
    { header: "Start time", cell: (o) => formatDateTime(o.startTime) },
    { header: "Expected restoration", cell: (o) => formatDateTime(o.expectedRestoration) },
    { header: "Reason", cell: (o) => o.reason, className: "hidden lg:table-cell" },
  ];

  const activeCount = current.filter((o) => o.status !== "SCHEDULED").length;
  const scheduledCount = current.filter((o) => o.status === "SCHEDULED").length;
  const affectedAreas = new Set(current.map((o) => o.areaId)).size;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Active outages", value: activeCount, icon: Activity, tint: "from-rose-500 to-red-500", glow: "bg-rose-500", live: true },
          { title: "Scheduled outages", value: scheduledCount, icon: CalendarClock, tint: "from-sky-500 to-indigo-500", glow: "bg-sky-500", live: false },
          { title: "Areas affected", value: affectedAreas, icon: MapPinned, tint: "from-amber-500 to-orange-500", glow: "bg-amber-500", live: false },
        ].map((s) => (
          <div
            key={s.title}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/6"
          >
            <div className={`pointer-events-none absolute -top-12 -right-12 size-32 rounded-full ${s.glow} opacity-15 blur-3xl transition-opacity group-hover:opacity-30`} />
            <div className="relative flex items-center gap-4">
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${s.tint} text-white shadow-lg`}>
                <s.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm text-slate-400">
                  {s.title}
                  {s.live && !loading && s.value > 0 && (
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
                    </span>
                  )}
                </p>
                <p className="text-3xl font-bold text-white">{loading ? "-" : s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl bg-linear-to-br from-sky-400/30 via-white/10 to-indigo-500/30 p-px">
      <div className="overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#050d24]/95 backdrop-blur">
        <SearchFilterBar
          showSearch={false}
          filters={[
            { key: "zone", label: "All zones", options: zones.map((z) => ({ value: z.id, label: z.name })) },
            {
              key: "area",
              label: "All areas",
              options: areas
                .filter((a) => !zoneFilter || a.zoneId === zoneFilter)
                .map((a) => ({ value: a.id, label: a.name })),
            },
            {
              key: "type",
              label: "All types",
              options: [
                { value: "SCHEDULED", label: "Scheduled" },
                { value: "UNEXPECTED", label: "Unexpected" },
              ],
            },
          ]}
          dateFilter={{ key: "date", label: "Filter by date" }}
          popupClassName="dark"
        />
        <DataTable
          columns={columns}
          rows={paged.items}
          getRowId={(o) => o.id}
          loading={loading}
          emptyTitle="No outages match your filters"
          emptyDescription="Try another zone, area or date, or clear the filters."
        />
        <Pagination page={paged.page} totalPages={paged.totalPages} totalItems={paged.totalItems} />
      </div>
      </div>
    </div>
  );
}
