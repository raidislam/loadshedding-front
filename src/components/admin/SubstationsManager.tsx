"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SubstationFormDialog } from "@/components/admin/SubstationFormDialog";
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
import { getFeeders } from "@/services/feeders";
import { deleteSubstation, getSubstations } from "@/services/substations";
import { getZones } from "@/services/zones";
import type { Substation } from "@/types";

async function loadData() {
  const [zones, substations, feeders] = await Promise.all([getZones(), getSubstations(), getFeeders()]);
  return { zones, substations, feeders };
}

export function SubstationsManager() {
  const { data, loading, error, reload } = useLoad(loadData);
  const { get, page } = useUrlFilters();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Substation | undefined>();
  const [deleting, setDeleting] = useState<Substation | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const zones = data?.zones ?? [];
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? "-";

  const q = get("q").toLowerCase();
  const rows = (data?.substations ?? [])
    .filter((s) => !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
    .filter((s) => !get("zone") || s.zoneId === get("zone"))
    .filter((s) => !get("status") || s.status === get("status"));
  const paged = paginate(rows, page);

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteSubstation(deleting.id);
      toast.success(`Substation "${deleting.name}" deleted.`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the substation.");
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  }

  const columns: Column<Substation>[] = [
    { header: "Substation", cell: (s) => <Link href={`/admin/substations/${s.id}`} className="font-medium text-primary hover:underline">{s.name}</Link> },
    { header: "Code", cell: (s) => s.code },
    { header: "Zone", cell: (s) => zoneName(s.zoneId) },
    { header: "Capacity", cell: (s) => `${s.capacityMVA} MVA`, className: "hidden md:table-cell" },
    { header: "Feeders", cell: (s) => (data?.feeders ?? []).filter((f) => f.substationId === s.id).length, className: "hidden md:table-cell" },
    { header: "Status", cell: (s) => <StatusBadge {...OPERATIONAL_STATUS[s.status]} /> },
    {
      header: "Actions", className: "text-right",
      cell: (s) => (
        <RowActions label={s.name} viewHref={`/admin/substations/${s.id}`}
          onEdit={() => { setEditing(s); setFormOpen(true); }} onDelete={() => setDeleting(s)} />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Substations" description="Each substation belongs to a zone and supplies one or more feeders."
        actions={<Button onClick={() => { setEditing(undefined); setFormOpen(true); }}><Plus /> Add substation</Button>} />
      <Card className="gap-0 py-0">
        <SearchFilterBar searchPlaceholder="Search by name or code"
          filters={[
            { key: "zone", label: "All zones", options: zones.map((z) => ({ value: z.id, label: z.name })) },
            { key: "status", label: "All statuses", options: Object.entries(OPERATIONAL_STATUS).map(([value, s]) => ({ value, label: s.label })) },
          ]} />
        {error ? <p className="p-6 text-destructive">{error}</p> : (
          <DataTable columns={columns} rows={paged.items} getRowId={(s) => s.id} loading={loading}
            emptyTitle="No substations found" emptyDescription="Try a different search or filter, or add a substation." />
        )}
        <Pagination page={paged.page} totalPages={paged.totalPages} totalItems={paged.totalItems} />
      </Card>

      <SubstationFormDialog open={formOpen} onOpenChange={setFormOpen} substation={editing} zones={zones} onSaved={reload} />
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} destructive loading={deleteBusy}
        title="Delete this substation?" confirmLabel="Delete substation" onConfirm={confirmDelete}
        description={`"${deleting?.name}" will be removed permanently. A substation that still has feeders cannot be deleted.`} />
    </>
  );
}
