"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ZoneFormDialog } from "@/components/admin/ZoneFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { RowActions } from "@/components/shared/RowActions";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OPERATIONAL_STATUS } from "@/constants/statuses";
import { useLoad } from "@/hooks/useLoad";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { paginate } from "@/lib/paginate";
import { getAreas } from "@/services/areas";
import { getFeeders } from "@/services/feeders";
import { getSubstations } from "@/services/substations";
import { deleteZone, getZones } from "@/services/zones";
import type { Zone } from "@/types";

async function loadData() {
  const [zones, substations, feeders, areas] = await Promise.all([getZones(), getSubstations(), getFeeders(), getAreas()]);
  return { zones, substations, feeders, areas };
}

export function ZonesManager() {
  const { data, loading, error, reload } = useLoad(loadData);
  const { get, page } = useUrlFilters();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Zone | undefined>();
  const [deleting, setDeleting] = useState<Zone | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const q = get("q").toLowerCase();
  const status = get("status");
  const zones = (data?.zones ?? [])
    .filter((z) => !q || z.name.toLowerCase().includes(q) || z.code.toLowerCase().includes(q))
    .filter((z) => !status || z.status === status);
  const paged = paginate(zones, page);

  const substationsOf = (zoneId: string) => (data?.substations ?? []).filter((s) => s.zoneId === zoneId);
  const feederCount = (zoneId: string) => {
    const ids = substationsOf(zoneId).map((s) => s.id);
    return (data?.feeders ?? []).filter((f) => ids.includes(f.substationId)).length;
  };
  const areaCount = (zoneId: string) => (data?.areas ?? []).filter((a) => a.zoneId === zoneId).length;

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteZone(deleting.id);
      toast.success(`Zone "${deleting.name}" deleted.`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the zone.");
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  }

  const columns: Column<Zone>[] = [
    { header: "Zone", cell: (z) => <Link href={`/admin/zones/${z.id}`} className="font-medium text-primary hover:underline">{z.name}</Link> },
    { header: "Code", cell: (z) => z.code },
    { header: "Substations", cell: (z) => substationsOf(z.id).length },
    { header: "Feeders", cell: (z) => feederCount(z.id), className: "hidden md:table-cell" },
    { header: "Areas", cell: (z) => areaCount(z.id), className: "hidden md:table-cell" },
    { header: "Status", cell: (z) => <StatusBadge {...OPERATIONAL_STATUS[z.status]} /> },
    {
      header: "Actions",
      className: "text-right",
      cell: (z) => (
        <RowActions label={z.name} viewHref={`/admin/zones/${z.id}`}
          onEdit={() => { setEditing(z); setFormOpen(true); }} onDelete={() => setDeleting(z)} />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Distribution Zones" description="Large regions of the network. Each zone contains substations."
        actions={<Button onClick={() => { setEditing(undefined); setFormOpen(true); }}><Plus /> Add zone</Button>} />
      <Card className="gap-0 py-0">
        <SearchFilterBar searchPlaceholder="Search by name or code"
          filters={[{ key: "status", label: "All statuses", options: Object.entries(OPERATIONAL_STATUS).map(([value, s]) => ({ value, label: s.label })) }]} />
        {error ? <p className="p-6 text-destructive">{error}</p> : (
          <DataTable columns={columns} rows={paged.items} getRowId={(z) => z.id} loading={loading}
            emptyTitle="No zones found" emptyDescription="Try a different search, or add a new zone." />
        )}
        <Pagination page={paged.page} totalPages={paged.totalPages} totalItems={paged.totalItems} />
      </Card>

      <ZoneFormDialog open={formOpen} onOpenChange={setFormOpen} zone={editing} onSaved={reload} />
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} destructive loading={deleteBusy}
        title="Delete this zone?" confirmLabel="Delete zone" onConfirm={confirmDelete}
        description={`"${deleting?.name}" will be removed permanently. A zone that still has substations cannot be deleted.`} />
    </>
  );
}
