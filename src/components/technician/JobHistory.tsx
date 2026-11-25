"use client";

import { jobColumns } from "@/components/technician/AssignedJobs";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { Card } from "@/components/ui/card";
import { useList } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Assignment } from "@/types/api";

export function JobHistory() {
  const { page } = useUrlFilters();
  // GET /technicians/my-history - completed jobs with their repair records, newest first
  const { data, isLoading, error } = useList<Assignment>("technicians/my-history", { page, limit: 10 });

  const columns: Column<Assignment>[] = [
    ...jobColumns,
    { header: "Completed", cell: (j) => formatDateTime(j.completedAt ?? undefined), className: "hidden lg:table-cell" },
    {
      header: "Work done",
      cell: (j) => <span className="line-clamp-2 max-w-xs text-sm">{j.repairRecords[0]?.workDescription ?? "-"}</span>,
      className: "hidden xl:table-cell",
    },
  ];

  return (
    <>
      <PageHeader title="Job History" description="Jobs you have completed, newest first." />
      <Card className="gap-0 py-0">
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(j) => j.id}
            loading={isLoading}
            emptyTitle="No completed jobs yet"
            emptyDescription="Jobs you finish will be listed here."
          />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>
    </>
  );
}
