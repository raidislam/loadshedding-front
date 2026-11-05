"use client";

import Link from "next/link";
import { useTechnicianJobs } from "@/components/technician/useTechnicianJobs";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  OUTAGE_STATUS,
  OUTAGE_TYPE,
  PRIORITY,
  PRIORITY_ORDER,
} from "@/constants/statuses";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatDateTime } from "@/lib/format";
import { paginate } from "@/lib/paginate";
import type { Outage } from "@/types";

export function AssignedJobs() {
  const { data, loading, error } = useTechnicianJobs();
  const { get, page } = useUrlFilters();

  const areaName = (id: string) =>
    data?.areas.find((a) => a.id === id)?.name ?? "-";
  const zoneName = (id: string) =>
    data?.zones.find((z) => z.id === id)?.name ?? "-";

  // This page lists jobs that still need work. Finished jobs are on the History page.
  const q = get("q").toLowerCase();
  const rows = (data?.jobs ?? [])
    .filter((j) => ["ASSIGNED", "IN_PROGRESS"].includes(j.status))
    .filter(
      (j) =>
        !q ||
        j.id.toLowerCase().includes(q) ||
        areaName(j.areaId).toLowerCase().includes(q) ||
        j.reason.toLowerCase().includes(q),
    )
    .filter((j) => !get("status") || j.status === get("status"))
    .filter((j) => !get("priority") || j.priority === get("priority"))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const paged = paginate(rows, page);

  const columns: Column<Outage>[] = [
    {
      header: "Job",
      cell: (j) => (
        <Link
          href={`/technician/jobs/${j.id}`}
          className="font-medium text-primary hover:underline"
        >
          {j.id}
        </Link>
      ),
    },
    {
      header: "Type",
      cell: (j) => <StatusBadge {...OUTAGE_TYPE[j.type]} />,
      className: "hidden md:table-cell",
    },
    {
      header: "Location",
      cell: (j) => (
        <div>
          <p>{areaName(j.areaId)}</p>
          <p className="text-xs text-muted-foreground">{zoneName(j.zoneId)}</p>
        </div>
      ),
    },
    {
      header: "Priority",
      cell: (j) => <StatusBadge {...PRIORITY[j.priority]} />,
    },
    {
      header: "Assigned",
      cell: (j) => formatDateTime(j.assignedAt),
      className: "hidden lg:table-cell",
    },
    {
      header: "Status",
      cell: (j) => <StatusBadge {...OUTAGE_STATUS[j.status]} />,
    },
    {
      header: "Open",
      className: "text-right",
      cell: (j) => (
        <Link
          href={`/technician/jobs/${j.id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Assigned Jobs"
        description="Jobs waiting for you, most urgent first."
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search job, area or reason"
          filters={[
            {
              key: "status",
              label: "All statuses",
              options: [
                { value: "ASSIGNED", label: "Assigned" },
                { value: "IN_PROGRESS", label: "In Progress" },
              ],
            },
            {
              key: "priority",
              label: "All priorities",
              options: Object.entries(PRIORITY).map(([value, p]) => ({
                value,
                label: p.label,
              })),
            },
          ]}
        />
        {error ? (
          <p className="p-6 text-destructive">{error}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={paged.items}
            getRowId={(j) => j.id}
            loading={loading}
            emptyTitle="No jobs to show"
            emptyDescription="You have no open jobs, or none match your filters."
          />
        )}
        <Pagination
          page={paged.page}
          totalPages={paged.totalPages}
          totalItems={paged.totalItems}
        />
      </Card>
    </>
  );
}
