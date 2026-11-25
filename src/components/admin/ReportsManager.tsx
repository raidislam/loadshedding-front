"use client";

import { useState } from "react";
import { ReviewReportDialog } from "@/components/admin/ReviewReportDialog";
import { ReportDetailsDialog } from "@/components/customer/ReportDetailsDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { REPORT_STATUS, toOptions } from "@/constants/labels";
import { useList, useOptions } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { OutageReport, Zone } from "@/types/api";

export function ReportsManager() {
  const { get, page } = useUrlFilters();
  const [reviewing, setReviewing] = useState<OutageReport | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const { data: zones = [] } = useOptions<Zone>("zones", { sortBy: "name", sortOrder: "asc" });
  // GET /outage-reports (admin only): search, filters and pages on the backend
  const { data, isLoading, error } = useList<OutageReport>("outage-reports", {
    page,
    limit: 10,
    searchTerm: get("q") || undefined,
    status: get("status") || undefined,
    zoneId: get("zone") || undefined,
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
    {
      header: "Customer",
      cell: (r) => (
        <div>
          <p>{r.customer?.name ?? "-"}</p>
          <p className="text-xs text-muted-foreground">{r.customer?.phone ?? r.customer?.email}</p>
        </div>
      ),
    },
    { header: "Area", cell: (r) => r.area.name, className: "hidden md:table-cell" },
    { header: "Reported", cell: (r) => formatDateTime(r.createdAt), className: "hidden xl:table-cell" },
    { header: "Status", cell: (r) => <StatusBadge {...REPORT_STATUS[r.status]} /> },
    { header: "Technician", cell: (r) => r.assignment?.technician.name ?? "-", className: "hidden lg:table-cell" },
    {
      header: "Actions",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setViewingId(r.id)}>
            View
          </Button>
          {(r.status === "PENDING" || r.status === "UNDER_REVIEW") && (
            <Button size="sm" onClick={() => setReviewing(r)}>
              Review
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Customer Reports" description="Review unexpected outages reported by customers." />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search title, customer, area or address"
          filters={[
            { key: "status", label: "All statuses", options: toOptions(REPORT_STATUS) },
            { key: "zone", label: "All zones", options: zones.map((z) => ({ value: z.id, label: z.name })) },
          ]}
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(r) => r.id}
            loading={isLoading}
            emptyTitle="No reports found"
            emptyDescription="Customer reports will appear here."
          />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>

      <ReviewReportDialog key={reviewing?.id ?? "none"} report={reviewing} onClose={() => setReviewing(null)} />
      <ReportDetailsDialog reportId={viewingId} onClose={() => setViewingId(null)} />
    </>
  );
}
