"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReportsAnalytics } from "@/components/admin/ReportsAnalytics";
import { ReviewReportDialog } from "@/components/admin/ReviewReportDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OUTAGE_STATUS, REPORT_CATEGORY_LABEL } from "@/constants/statuses";
import { useLoad } from "@/hooks/useLoad";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatDateTime } from "@/lib/format";
import { paginate } from "@/lib/paginate";
import { getAreas } from "@/services/areas";
import { getMonthlyOutageStats, getZoneOutageStats } from "@/services/dashboard";
import { getOutages } from "@/services/outages";
import { getReports } from "@/services/reports";
import { getTechnicians } from "@/services/technicians";
import { getUsers } from "@/services/users";
import type { OutageReport } from "@/types";

async function loadData() {
  const [reports, areas, users, technicians, outages, monthly, zoneStats] = await Promise.all([
    getReports(), getAreas(), getUsers(), getTechnicians(), getOutages(), getMonthlyOutageStats(), getZoneOutageStats(),
  ]);
  return { reports, areas, users, technicians, outages, monthly, zoneStats };
}

export function ReportsManager() {
  const { data, loading, error, reload } = useLoad(loadData);
  const { get, setParams, page } = useUrlFilters();
  const [reviewing, setReviewing] = useState<OutageReport | null>(null);

  const tab = get("tab", "reports");
  const areaName = (id: string) => data?.areas.find((a) => a.id === id)?.name ?? "-";
  const userName = (id: string) => data?.users.find((u) => u.id === id)?.name ?? "-";
  const techName = (id?: string) => data?.technicians.find((t) => t.id === id)?.name ?? "-";

  const q = get("q").toLowerCase();
  const rows = (data?.reports ?? [])
    .filter((r) => !q || r.id.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || areaName(r.areaId).toLowerCase().includes(q))
    .filter((r) => !get("status") || r.status === get("status"));
  const paged = paginate(rows, page);

  const columns: Column<OutageReport>[] = [
    { header: "Report", cell: (r) => <span className="font-medium">{r.id}</span> },
    { header: "Customer", cell: (r) => userName(r.customerId) },
    { header: "Area", cell: (r) => areaName(r.areaId), className: "hidden md:table-cell" },
    { header: "Problem", cell: (r) => REPORT_CATEGORY_LABEL[r.category], className: "hidden lg:table-cell" },
    { header: "Reported", cell: (r) => formatDateTime(r.createdAt), className: "hidden xl:table-cell" },
    { header: "Status", cell: (r) => <StatusBadge {...OUTAGE_STATUS[r.status]} /> },
    { header: "Technician", cell: (r) => techName(r.technicianId), className: "hidden lg:table-cell" },
    {
      header: "Action", className: "text-right",
      cell: (r) => r.status === "REPORTED" ? (
        <Button size="sm" onClick={() => setReviewing(r)}>Review</Button>
      ) : r.outageId ? (
        <Link href={`/admin/outages/${r.outageId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>View outage</Link>
      ) : null,
    },
  ];

  return (
    <>
      <PageHeader title="Reports" description="Review customer reports, assign technicians and see how the network is performing." />
      <Tabs value={tab} onValueChange={(v) => setParams({ tab: String(v) })}>
        <TabsList className="mb-4">
          <TabsTrigger value="reports">Customer reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card className="gap-0 py-0">
            <SearchFilterBar searchPlaceholder="Search ID, area or text"
              filters={[{ key: "status", label: "All statuses", options: Object.entries(OUTAGE_STATUS).filter(([s]) => ["REPORTED", "ASSIGNED", "IN_PROGRESS", "REPAIR_COMPLETED", "RESTORED"].includes(s)).map(([value, s]) => ({ value, label: s.label })) }]} />
            {error ? <p className="p-6 text-destructive">{error}</p> : (
              <DataTable columns={columns} rows={paged.items} getRowId={(r) => r.id} loading={loading}
                emptyTitle="No reports found" emptyDescription="Customer reports will appear here." />
            )}
            <Pagination page={paged.page} totalPages={paged.totalPages} totalItems={paged.totalItems} />
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          {data ? (
            <ReportsAnalytics monthly={data.monthly} zones={data.zoneStats} reports={data.reports} outages={data.outages} technicians={data.technicians} />
          ) : <Card><TableSkeleton /></Card>}
        </TabsContent>
      </Tabs>

      <ReviewReportDialog report={reviewing} technicians={data?.technicians ?? []}
        customer={data?.users.find((u) => u.id === reviewing?.customerId)}
        area={data?.areas.find((a) => a.id === reviewing?.areaId)}
        onClose={() => setReviewing(null)} onAssigned={reload} />
    </>
  );
}
