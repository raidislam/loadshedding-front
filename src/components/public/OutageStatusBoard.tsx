import { Activity, CalendarClock, MapPinned } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { OUTAGE_STATUS, OUTAGE_TYPE, toOptions } from "@/constants/labels";
import { formatDateTime } from "@/lib/format";
import { fetchPublic, getZoneAndAreaOptions } from "@/lib/server/publicApi";
import type { Outage } from "@/types/api";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

// SERVER COMPONENT: runs on the server, reads the filters from the URL,
// calls the public API and sends finished HTML to the browser.
// The filter bar and pagination are small client components that only change the URL.
export async function OutageStatusBoard({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const zone = one(params.zone);
  const area = one(params.area);
  const type = one(params.type);
  const status = one(params.status);
  const date = one(params.date); // "2026-11-25"
  const page = Math.max(1, Number(one(params.page)) || 1);

  const [options, outages, ongoing, upcoming] = await Promise.all([
    getZoneAndAreaOptions(), // cached for a few minutes
    fetchPublic<Outage[]>("/outages", {
      page,
      limit: 10,
      zoneId: zone,
      areaId: area,
      type,
      status,
      // Outages that start on the chosen day (Bangladesh time)
      from: date ? `${date}T00:00:00+06:00` : undefined,
      to: date ? `${date}T23:59:59+06:00` : undefined,
      sortBy: "startTime",
      sortOrder: "desc",
    }),
    fetchPublic<Outage[]>("/outages", { status: "ONGOING", limit: 100 }),
    fetchPublic<Outage[]>("/outages", { status: "SCHEDULED", limit: 1 }),
  ]);

  const stats = [
    { title: "Ongoing outages", value: ongoing.meta?.total ?? 0, icon: Activity, tint: "from-rose-500 to-red-500", glow: "bg-rose-500", live: true },
    { title: "Scheduled outages", value: upcoming.meta?.total ?? 0, icon: CalendarClock, tint: "from-sky-500 to-indigo-500", glow: "bg-sky-500", live: false },
    { title: "Areas without power", value: new Set(ongoing.data.map((o) => o.areaId)).size, icon: MapPinned, tint: "from-amber-500 to-orange-500", glow: "bg-amber-500", live: false },
  ];

  const columns: Column<Outage>[] = [
    {
      header: "Affected area",
      cell: (o) => (
        <div>
          <p className="font-medium">{o.area.name}</p>
          <p className="text-xs text-muted-foreground">
            {o.area.feeder.substation.zone.name} · {o.area.feeder.name}
          </p>
        </div>
      ),
    },
    { header: "Type", cell: (o) => <StatusBadge {...OUTAGE_TYPE[o.type]} /> },
    { header: "Status", cell: (o) => <StatusBadge {...OUTAGE_STATUS[o.status]} /> },
    { header: "Start time", cell: (o) => formatDateTime(o.startTime) },
    {
      header: "Restoration",
      cell: (o) =>
        o.actualRestoreTime ? (
          <span>Restored {formatDateTime(o.actualRestoreTime)}</span>
        ) : (
          <span>Expected {formatDateTime(o.expectedRestoreTime)}</span>
        ),
    },
    { header: "Reason", cell: (o) => o.reason, className: "hidden lg:table-cell" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
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
                  {s.live && s.value > 0 && (
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
                    </span>
                  )}
                </p>
                <p className="text-3xl font-bold text-white">{s.value}</p>
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
              { key: "zone", label: "All zones", options: options.zones.map((z) => ({ value: z.id, label: z.name })) },
              {
                key: "area",
                label: "All areas",
                options: options.areas
                  .filter((a) => !zone || a.feeder.substation.zone.id === zone)
                  .map((a) => ({ value: a.id, label: a.name })),
              },
              { key: "type", label: "All types", options: toOptions(OUTAGE_TYPE) },
              { key: "status", label: "All statuses", options: toOptions(OUTAGE_STATUS) },
            ]}
            dateFilter={{ key: "date", label: "Start date" }}
            popupClassName="dark"
          />
          <DataTable
            columns={columns}
            rows={outages.data}
            getRowId={(o) => o.id}
            emptyTitle="No outages match your filters"
            emptyDescription="Try another zone, area, status or date, or clear the filters."
          />
          <Pagination
            page={outages.meta?.page ?? 1}
            totalPages={outages.meta?.totalPages ?? 1}
            totalItems={outages.meta?.total ?? 0}
          />
        </div>
      </div>
    </div>
  );
}
