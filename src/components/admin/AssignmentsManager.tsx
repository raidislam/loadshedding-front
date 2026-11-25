"use client";

import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { ASSIGNMENT_STATUS, toOptions } from "@/constants/labels";
import { useList } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Assignment } from "@/types/api";

// Admin: monitor every repair job (GET /assignments)
export function AssignmentsManager() {
  const { get, page } = useUrlFilters();
  const { data, isLoading, error } = useList<Assignment>("assignments", {
    page,
    limit: 10,
    status: get("status") || undefined,
    searchTerm: get("q") || undefined,
    sortBy: "assignedAt",
    sortOrder: "desc",
  });

  const columns: Column<Assignment>[] = [
    {
      header: "Job",
      cell: (a) => (
        <div className="max-w-xs">
          <p className="font-medium">{a.report.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {a.report.area.name} · {a.report.customer.name}
          </p>
        </div>
      ),
    },
    {
      header: "Technician",
      cell: (a) => (
        <div>
          <p>{a.technician.name}</p>
          <p className="text-xs text-muted-foreground">{a.technician.phone ?? ""}</p>
        </div>
      ),
    },
    { header: "Status", cell: (a) => <StatusBadge {...ASSIGNMENT_STATUS[a.status]} /> },
    { header: "Assigned", cell: (a) => formatDateTime(a.assignedAt), className: "hidden md:table-cell" },
    { header: "Started", cell: (a) => formatDateTime(a.startedAt ?? undefined), className: "hidden lg:table-cell" },
    { header: "Completed", cell: (a) => formatDateTime(a.completedAt ?? undefined), className: "hidden lg:table-cell" },
    {
      header: "Repair",
      cell: (a) => (a.repairRecords[0] ? <span className="line-clamp-2 max-w-xs text-sm">{a.repairRecords[0].workDescription}</span> : "-"),
      className: "hidden xl:table-cell",
    },
  ];

  return (
    <>
      <PageHeader title="Repair Jobs" description="Every technician assignment and how far the repair has come." />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search technician or report title"
          filters={[{ key: "status", label: "All statuses", options: toOptions(ASSIGNMENT_STATUS) }]}
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(a) => a.id}
            loading={isLoading}
            emptyTitle="No repair jobs yet"
            emptyDescription="Assign a technician from Customer Reports."
          />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>
    </>
  );
}
