"use client";

import { Activity, CalendarClock, MapPinned } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
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

  if (error) return <Card className="p-6 text-destructive">{error}</Card>;

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
        <StatCard title="Active outages" value={loading ? "-" : activeCount} icon={Activity} tone="danger" />
        <StatCard title="Scheduled outages" value={loading ? "-" : scheduledCount} icon={CalendarClock} tone="primary" />
        <StatCard title="Areas affected" value={loading ? "-" : affectedAreas} icon={MapPinned} tone="warning" />
      </div>

      <Card className="gap-0 py-0">
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
      </Card>
    </div>
  );
}
