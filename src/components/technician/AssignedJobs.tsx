"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ASSIGNMENT_STATUS } from "@/constants/labels";
import { useList } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Assignment } from "@/types/api";

// Columns shared by "Assigned Jobs" and "Job History"
export const jobColumns: Column<Assignment>[] = [
  {
    header: "Job",
    cell: (j) => (
      <div className="max-w-xs">
        <Link href={`/technician/jobs/${j.id}`} className="font-medium text-primary hover:underline">
          {j.report.title}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{j.report.address ?? j.report.description}</p>
      </div>
    ),
  },
  {
    header: "Location",
    cell: (j) => (
      <div>
        <p>{j.report.area.name}</p>
        <p className="text-xs text-muted-foreground">{j.report.area.feeder.substation.zone.name}</p>
      </div>
    ),
  },
  {
    header: "Customer",
    cell: (j) => (
      <div>
        <p>{j.report.customer.name}</p>
        <p className="text-xs text-muted-foreground">{j.report.customer.phone ?? ""}</p>
      </div>
    ),
    className: "hidden md:table-cell",
  },
  { header: "Status", cell: (j) => <StatusBadge {...ASSIGNMENT_STATUS[j.status]} /> },
];

export function AssignedJobs() {
  const { get, page } = useUrlFilters();
  // GET /technicians/my-jobs - only this technician's unfinished jobs, oldest first
  const { data, isLoading, error } = useList<Assignment>("technicians/my-jobs", {
    page,
    limit: 10,
    status: get("status") || undefined,
  });

  const columns: Column<Assignment>[] = [
    ...jobColumns,
    { header: "Assigned", cell: (j) => formatDateTime(j.assignedAt), className: "hidden lg:table-cell" },
    {
      header: "Open",
      className: "text-right",
      cell: (j) => (
        <Link href={`/technician/jobs/${j.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          View
        </Link>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Assigned Jobs" description="Jobs waiting for you, oldest first." />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          showSearch={false}
          filters={[
            {
              key: "status",
              label: "All open jobs",
              options: (["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] as const).map((s) => ({ value: s, label: ASSIGNMENT_STATUS[s].label })),
            },
          ]}
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(j) => j.id}
            loading={isLoading}
            emptyTitle="No jobs to show"
            emptyDescription="You have no open jobs right now."
          />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>
    </>
  );
}
