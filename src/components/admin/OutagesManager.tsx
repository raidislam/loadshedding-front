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
import { OUTAGE_STATUS, OUTAGE_TYPE, toOptions } from "@/constants/labels";
import { useList, useOptions } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Outage, Zone } from "@/types/api";

export function OutagesManager() {
  const { get, page } = useUrlFilters();
  // The backend search needs at least 2 characters; until then show the normal list
  const q = get("q").trim().length >= 2 ? get("q").trim() : "";

  const { data: zones = [] } = useOptions<Zone>("zones", { sortBy: "name", sortOrder: "asc" });

  // With search text: GET /outages/search?q=...  (title, reason, area / feeder / substation / zone names)
  // Without:          GET /outages?type=&status=&zoneId=  (filters, newest start first)
  const { data, isLoading, error } = useList<Outage>(
    q ? "outages/search" : "outages",
    q
      ? { q, page, limit: 10 }
      : {
          page,
          limit: 10,
          type: get("type") || undefined,
          status: get("status") || undefined,
          zoneId: get("zone") || undefined,
          sortBy: "startTime",
          sortOrder: "desc",
        },
  );

  const columns: Column<Outage>[] = [
    {
      header: "Outage",
      cell: (o) => (
        <div>
          <Link href={`/admin/outages/${o.id}`} className="font-medium text-primary hover:underline">
            {o.title}
          </Link>
          <p className="text-xs text-muted-foreground">{o.reason}</p>
        </div>
      ),
    },
    { header: "Type", cell: (o) => <StatusBadge {...OUTAGE_TYPE[o.type]} /> },
    {
      header: "Area",
      cell: (o) => (
        <div>
          <p>{o.area.name}</p>
          <p className="text-xs text-muted-foreground">{o.area.feeder.substation.zone.name}</p>
        </div>
      ),
    },
    { header: "Status", cell: (o) => <StatusBadge {...OUTAGE_STATUS[o.status]} /> },
    { header: "Start", cell: (o) => formatDateTime(o.startTime), className: "hidden lg:table-cell" },
    {
      header: "Restoration",
      cell: (o) => (o.actualRestoreTime ? `Restored ${formatDateTime(o.actualRestoreTime)}` : `Expected ${formatDateTime(o.expectedRestoreTime)}`),
      className: "hidden xl:table-cell",
    },
  ];

  return (
    <>
      <PageHeader
        title="Outage Management"
        description="Scheduled load shedding and unexpected outages in one list."
        actions={
          <Link href="/admin/outages/new" className={buttonVariants()}>
            <Plus /> Create outage
          </Link>
        }
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search title, reason, area or zone"
          filters={
            q
              ? [] // the search endpoint has no filters, so hide them while searching
              : [
                  { key: "type", label: "All types", options: toOptions(OUTAGE_TYPE) },
                  { key: "status", label: "All statuses", options: toOptions(OUTAGE_STATUS) },
                  { key: "zone", label: "All zones", options: zones.map((z) => ({ value: z.id, label: z.name })) },
                ]
          }
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(o) => o.id}
            loading={isLoading}
            emptyTitle={q ? "No outages match your search" : "No outages match your filters"}
            emptyDescription="Try clearing the search or a filter, or create a new outage."
          />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>
    </>
  );
}
