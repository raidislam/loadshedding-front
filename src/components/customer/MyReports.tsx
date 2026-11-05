"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { FilePlus } from "lucide-react";
import { ReportDetailsDialog } from "@/components/customer/ReportDetailsDialog";
import { useRequiredUser } from "@/components/layout/AuthProvider";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OUTAGE_STATUS, REPORT_CATEGORY_LABEL, REPAIR_STEPS } from "@/constants/statuses";
import { useLoad } from "@/hooks/useLoad";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatDateTime } from "@/lib/format";
import { paginate } from "@/lib/paginate";
import { getAreas } from "@/services/areas";
import { getCustomerReports } from "@/services/reports";
import { getTechnicians } from "@/services/technicians";
import type { OutageReport } from "@/types";

async function loadData(userId: string) {
  const [reports, areas, technicians] = await Promise.all([getCustomerReports(userId), getAreas(), getTechnicians()]);
  return { reports, areas, technicians };
}

export function MyReports() {
  const user = useRequiredUser();
  const loader = useCallback(() => loadData(user.id), [user.id]);
  const { data, loading, error } = useLoad(loader);
  const { get, page } = useUrlFilters();
  const [selected, setSelected] = useState<OutageReport | null>(null);

  const techName = (id?: string) => data?.technicians.find((t) => t.id === id)?.name ?? "Not assigned";

  const q = get("q").toLowerCase();
  const rows = (data?.reports ?? [])
    .filter((r) => !q || r.id.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    .filter((r) => !get("status") || r.status === get("status"));
  const paged = paginate(rows, page);

  const columns: Column<OutageReport>[] = [
    { header: "Report", cell: (r) => <span className="font-medium">{r.id}</span> },
    {
      header: "Problem",
      cell: (r) => (
        <div className="max-w-xs">
          <p className="font-medium">{REPORT_CATEGORY_LABEL[r.category]}</p>
          <p className="truncate text-xs text-muted-foreground">{r.description}</p>
        </div>
      ),
    },
    { header: "Reported", cell: (r) => formatDateTime(r.createdAt), className: "hidden lg:table-cell" },
    { header: "Status", cell: (r) => <StatusBadge {...OUTAGE_STATUS[r.status]} /> },
    { header: "Technician", cell: (r) => techName(r.technicianId), className: "hidden xl:table-cell" },
    { header: "Est. restoration", cell: (r) => (r.estimatedRestoration ? formatDateTime(r.estimatedRestoration) : "-"), className: "hidden xl:table-cell" },
    { header: "Details", className: "text-right", cell: (r) => <Button size="sm" variant="outline" onClick={() => setSelected(r)}>View</Button> },
  ];

  return (
    <>
      <PageHeader title="My Reports" description="Every outage you have reported and where it stands."
        actions={<Link href="/dashboard/report-outage" className={buttonVariants()}><FilePlus /> New report</Link>} />
      <Card className="gap-0 py-0">
        <SearchFilterBar searchPlaceholder="Search report ID or text"
          filters={[{ key: "status", label: "All statuses", options: REPAIR_STEPS.map((s) => ({ value: s, label: OUTAGE_STATUS[s].label })) }]} />
        {error ? <p className="p-6 text-destructive">{error}</p> : (
          <DataTable columns={columns} rows={paged.items} getRowId={(r) => r.id} loading={loading}
            emptyTitle="No reports found" emptyDescription="Reports you submit will appear here." />
        )}
        <Pagination page={paged.page} totalPages={paged.totalPages} totalItems={paged.totalItems} />
      </Card>

      <ReportDetailsDialog report={selected} onClose={() => setSelected(null)}
        area={data?.areas.find((a) => a.id === selected?.areaId)}
        technician={data?.technicians.find((t) => t.id === selected?.technicianId)} />
    </>
  );
}
