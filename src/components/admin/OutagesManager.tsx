"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OUTAGE_STATUS, OUTAGE_TYPE, PRIORITY } from "@/constants/statuses";
import { useLoad } from "@/hooks/useLoad";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatDateTime } from "@/lib/format";
import { paginate } from "@/lib/paginate";
import { getAreas } from "@/services/areas";
import { getOutages } from "@/services/outages";
import { getTechnicians } from "@/services/technicians";
import { getZones } from "@/services/zones";
import type { Outage } from "@/types";

async function loadData() {
  const [outages, areas, zones, technicians] = await Promise.all([getOutages(), getAreas(), getZones(), getTechnicians()]);
  return { outages, areas, zones, technicians };
}

export function OutagesManager() {
  const { data, loading, error } = useLoad(loadData);
  const { get, page } = useUrlFilters();

  const areas = data?.areas ?? [];
  const zones = data?.zones ?? [];
  const areaName = (id: string) => areas.find((a) => a.id === id)?.name ?? "-";
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? "-";
  const techName = (id?: string) => (data?.technicians ?? []).find((t) => t.id === id)?.name ?? "-";

  // Example URL: /admin/outages?page=1&type=UNEXPECTED&status=ACTIVE
  const q = get("q").toLowerCase();
  const rows = (data?.outages ?? [])
    .filter((o) => !q || o.id.toLowerCase().includes(q) || areaName(o.areaId).toLowerCase().includes(q) || o.reason.toLowerCase().includes(q))
    .filter((o) => !get("type") || o.type === get("type"))
    .filter((o) => !get("status") || o.status === get("status"))
    .filter((o) => !get("zone") || o.zoneId === get("zone"));
  const paged = paginate(rows, page);

  const columns: Column<Outage>[] = [
    { header: "Outage", cell: (o) => <Link href={`/admin/outages/${o.id}`} className="font-medium text-primary hover:underline">{o.id}</Link> },
    { header: "Type", cell: (o) => <StatusBadge {...OUTAGE_TYPE[o.type]} /> },
    { header: "Area", cell: (o) => (<div><p>{areaName(o.areaId)}</p><p className="text-xs text-muted-foreground">{zoneName(o.zoneId)}</p></div>) },
    { header: "Status", cell: (o) => <StatusBadge {...OUTAGE_STATUS[o.status]} /> },
    { header: "Priority", cell: (o) => <StatusBadge {...PRIORITY[o.priority]} />, className: "hidden md:table-cell" },
    { header: "Start", cell: (o) => formatDateTime(o.startTime), className: "hidden lg:table-cell" },
    { header: "Expected restoration", cell: (o) => formatDateTime(o.expectedRestoration), className: "hidden xl:table-cell" },
    { header: "Technician", cell: (o) => techName(o.technicianId), className: "hidden lg:table-cell" },
  ];

  return (
    <>
      <PageHeader title="Outage Management" description="Scheduled load shedding and unexpected outages in one list."
        actions={<Link href="/admin/outages/new" className={buttonVariants()}><Plus /> Schedule outage</Link>} />
      <Card className="gap-0 py-0">
        <SearchFilterBar searchPlaceholder="Search ID, area or reason"
          filters={[
            { key: "type", label: "All types", options: Object.entries(OUTAGE_TYPE).map(([value, s]) => ({ value, label: s.label })) },
            { key: "status", label: "All statuses", options: Object.entries(OUTAGE_STATUS).map(([value, s]) => ({ value, label: s.label })) },
            { key: "zone", label: "All zones", options: zones.map((z) => ({ value: z.id, label: z.name })) },
          ]} />
        {error ? <p className="p-6 text-destructive">{error}</p> : (
          <DataTable columns={columns} rows={paged.items} getRowId={(o) => o.id} loading={loading}
            emptyTitle="No outages match your filters" emptyDescription="Try clearing a filter, or schedule a new outage." />
        )}
        <Pagination page={paged.page} totalPages={paged.totalPages} totalItems={paged.totalItems} />
      </Card>
    </>
  );
}
