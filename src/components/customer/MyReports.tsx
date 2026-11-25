"use client";

import { FilePlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ReportDetailsDialog } from "@/components/customer/ReportDetailsDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { REPORT_STATUS, toOptions } from "@/constants/labels";
import { useList } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { OutageReport } from "@/types/api";

export function MyReports() {
  const { get, page } = useUrlFilters();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // GET /outage-reports/my-reports - the backend only returns this customer's reports
  const { data, isLoading, error } = useList<OutageReport>("outage-reports/my-reports", {
    page,
    limit: 10,
    status: get("status") || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const columns: Column<OutageReport>[] = [
    {
      header: "Report",
      cell: (r) => (
        <div className="max-w-xs">
          <p className="font-medium">{r.title}</p>
          <p className="truncate text-xs text-muted-foreground">{r.description}</p>
        </div>
      ),
    },
    { header: "Area", cell: (r) => r.area.name, className: "hidden md:table-cell" },
    { header: "Reported", cell: (r) => formatDateTime(r.createdAt), className: "hidden lg:table-cell" },
    { header: "Status", cell: (r) => <StatusBadge {...REPORT_STATUS[r.status]} /> },
    { header: "Technician", cell: (r) => r.assignment?.technician.name ?? "Not assigned", className: "hidden xl:table-cell" },
    {
      header: "Details",
      className: "text-right",
      cell: (r) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedId(r.id)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="My Reports"
        description="Every outage you have reported and where it stands."
        actions={
          <Link href="/dashboard/report-outage" className={buttonVariants()}>
            <FilePlus /> New report
          </Link>
        }
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar showSearch={false} filters={[{ key: "status", label: "All statuses", options: toOptions(REPORT_STATUS) }]} />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(r) => r.id}
            loading={isLoading}
            emptyTitle="No reports found"
            emptyDescription="Reports you submit will appear here."
          />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>

      <ReportDetailsDialog reportId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
