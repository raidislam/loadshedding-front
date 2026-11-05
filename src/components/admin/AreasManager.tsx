"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AreaFormDialog } from "@/components/admin/AreaFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { RowActions } from "@/components/shared/RowActions";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLoad } from "@/hooks/useLoad";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatNumber } from "@/lib/format";
import { paginate } from "@/lib/paginate";
import { deleteArea, getAreas } from "@/services/areas";
import { getFeeders } from "@/services/feeders";
import { getSubstations } from "@/services/substations";
import { getZones } from "@/services/zones";
import type { Area } from "@/types";

async function loadData() {
  const [zones, substations, feeders, areas] = await Promise.all([getZones(), getSubstations(), getFeeders(), getAreas()]);
  return { zones, substations, feeders, areas };
}

export function AreasManager() {
  const { data, loading, error, reload } = useLoad(loadData);
  const { get, page } = useUrlFilters();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Area | undefined>();
  const [deleting, setDeleting] = useState<Area | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const zones = data?.zones ?? [];
  const substations = data?.substations ?? [];
  const feeders = data?.feeders ?? [];
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? "-";
  const substationName = (id: string) => substations.find((s) => s.id === id)?.name ?? "-";
  const feederCode = (id: string) => feeders.find((f) => f.id === id)?.code ?? "-";

  const q = get("q").toLowerCase();
  const rows = (data?.areas ?? [])
    .filter((a) => !q || a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q))
    .filter((a) => !get("zone") || a.zoneId === get("zone"))
    .filter((a) => !get("feeder") || a.feederId === get("feeder"));
  const paged = paginate(rows, page);

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteArea(deleting.id);
      toast.success(`Area "${deleting.name}" deleted.`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the area.");
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  }

  const columns: Column<Area>[] = [
    { header: "Area", cell: (a) => <Link href={`/admin/areas/${a.id}`} className="font-medium text-primary hover:underline">{a.name}</Link> },
    { header: "Code", cell: (a) => a.code },
    { header: "Zone", cell: (a) => zoneName(a.zoneId), className: "hidden md:table-cell" },
    { header: "Substation", cell: (a) => substationName(a.substationId), className: "hidden lg:table-cell" },
    { header: "Feeder", cell: (a) => feederCode(a.feederId) },
    { header: "Customers", cell: (a) => formatNumber(a.customerCount) },
    {
      header: "Actions", className: "text-right",
      cell: (a) => (
        <RowActions label={a.name} viewHref={`/admin/areas/${a.id}`}
          onEdit={() => { setEditing(a); setFormOpen(true); }} onDelete={() => setDeleting(a)} />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Areas" description="Neighbourhoods served by a feeder. Customers and outages are linked to areas."
        actions={<Button onClick={() => { setEditing(undefined); setFormOpen(true); }}><Plus /> Add area</Button>} />
      <Card className="gap-0 py-0">
        <SearchFilterBar searchPlaceholder="Search by name or code"
          filters={[
            { key: "zone", label: "All zones", options: zones.map((z) => ({ value: z.id, label: z.name })) },
            { key: "feeder", label: "All feeders", options: feeders.map((f) => ({ value: f.id, label: f.code })) },
          ]} />
        {error ? <p className="p-6 text-destructive">{error}</p> : (
          <DataTable columns={columns} rows={paged.items} getRowId={(a) => a.id} loading={loading}
            emptyTitle="No areas found" emptyDescription="Try a different search or filter, or add an area." />
        )}
        <Pagination page={paged.page} totalPages={paged.totalPages} totalItems={paged.totalItems} />
      </Card>

      <AreaFormDialog open={formOpen} onOpenChange={setFormOpen} area={editing} zones={zones}
        substations={substations} feeders={feeders} onSaved={reload} />
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} destructive loading={deleteBusy}
        title="Delete this area?" confirmLabel="Delete area" onConfirm={confirmDelete}
        description={`"${deleting?.name}" will be removed permanently. Existing outage records for this area will keep their history.`} />
    </>
  );
}
