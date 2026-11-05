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
import { OUTAGE_STATUS } from "@/constants/statuses";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatDateTime } from "@/lib/format";
import { paginate } from "@/lib/paginate";
import type { Outage } from "@/types";

export function JobHistory() {
  const { data, loading, error } = useTechnicianJobs();
  const { get, page } = useUrlFilters();

  const areaName = (id: string) =>
    data?.areas.find((a) => a.id === id)?.name ?? "-";

  const q = get("q").toLowerCase();
  const rows = (data?.jobs ?? [])
    .filter((j) => ["REPAIR_COMPLETED", "RESTORED"].includes(j.status))
    .filter(
      (j) =>
        !q ||
        j.id.toLowerCase().includes(q) ||
        areaName(j.areaId).toLowerCase().includes(q) ||
        (j.completionSummary ?? "").toLowerCase().includes(q),
    )
    .filter((j) => !get("status") || j.status === get("status"));
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
    { header: "Area", cell: (j) => areaName(j.areaId) },
    {
      header: "Status",
      cell: (j) => <StatusBadge {...OUTAGE_STATUS[j.status]} />,
    },
    {
      header: "Restored on",
      cell: (j) =>
        j.restoredAt
          ? formatDateTime(j.restoredAt)
          : "Waiting for admin confirmation",
      className: "hidden md:table-cell",
    },
    {
      header: "Repair summary",
      cell: (j) => (
        <p className="line-clamp-2 max-w-sm text-sm text-muted-foreground">
          {j.completionSummary ?? "-"}
        </p>
      ),
      className: "hidden lg:table-cell",
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
        title="Job History"
        description="Repairs you have completed."
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search job, area or summary"
          filters={[
            {
              key: "status",
              label: "All statuses",
              options: [
                { value: "REPAIR_COMPLETED", label: "Repair Completed" },
                { value: "RESTORED", label: "Restored" },
              ],
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
            emptyTitle="No completed jobs yet"
            emptyDescription="Jobs you finish will be listed here with their repair summary."
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
