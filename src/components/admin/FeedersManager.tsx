"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { FeederFormDialog } from "@/components/admin/FeederFormDialog";
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
import { deleteFeeder, getFeeders } from "@/services/feeders";
import { getSubstations } from "@/services/substations";
import type { Feeder } from "@/types";

async function loadData() {
  const [substations, feeders, areas] = await Promise.all([getSubstations(), getFeeders(), getAreas()]);
  return { substations, feeders, areas };
}

export function FeedersManager() {
  const { data, loading, error, reload } = useLoad(loadData);
  const { get, page } = useUrlFilters();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Feeder | undefined>();
  const [deleting, setDeleting] = useState<Feeder | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const substations = data?.substations ?? [];
  const substationName = (id: string) => substations.find((s) => s.id === id)?.name ?? "-";

  const q = get("q").toLowerCase();
  const rows = (data?.feeders ?? [])
    .filter((f) => !q || f.code.toLowerCase().includes(q))
    .filter((f) => !get("substation") || f.substationId === get("substation"))
    .filter((f) => !get("status") || f.status === get("status"));
  const paged = paginate(rows, page);

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteFeeder(deleting.id);
      toast.success(`Feeder ${deleting.code} deleted.`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the feeder.");
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  }

  const columns: Column<Feeder>[] = [
    { header: "Feeder code", cell: (f) => <Link href={`/admin/feeders/${f.id}`} className="font-medium text-primary hover:underline">{f.code}</Link> },
    { header: "Substation", cell: (f) => substationName(f.substationId) },
    { header: "Capacity", cell: (f) => `${f.capacityMW} MW`, className: "hidden md:table-cell" },
    { header: "Connected areas", cell: (f) => (data?.areas ?? []).filter((a) => a.feederId === f.id).length, className: "hidden md:table-cell" },
    { header: "Status", cell: (f) => <StatusBadge {...OPERATIONAL_STATUS[f.status]} /> },
    {
      header: "Actions", className: "text-right",
      cell: (f) => (
        <RowActions label={f.code} viewHref={`/admin/feeders/${f.id}`}
          onEdit={() => { setEditing(f); setFormOpen(true); }} onDelete={() => setDeleting(f)} />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Feeders" description="Power lines that leave a substation and supply areas."
        actions={<Button onClick={() => { setEditing(undefined); setFormOpen(true); }}><Plus /> Add feeder</Button>} />
      <Card className="gap-0 py-0">
        <SearchFilterBar searchPlaceholder="Search by feeder code"
          filters={[
            { key: "substation", label: "All substations", options: substations.map((s) => ({ value: s.id, label: s.name })) },
            { key: "status", label: "All statuses", options: Object.entries(OPERATIONAL_STATUS).map(([value, s]) => ({ value, label: s.label })) },
          ]} />
        {error ? <p className="p-6 text-destructive">{error}</p> : (
          <DataTable columns={columns} rows={paged.items} getRowId={(f) => f.id} loading={loading}
            emptyTitle="No feeders found" emptyDescription="Try a different search or filter, or add a feeder." />
        )}
        <Pagination page={paged.page} totalPages={paged.totalPages} totalItems={paged.totalItems} />
      </Card>

      <FeederFormDialog open={formOpen} onOpenChange={setFormOpen} feeder={editing} substations={substations} onSaved={reload} />
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} destructive loading={deleteBusy}
        title="Delete this feeder?" confirmLabel="Delete feeder" onConfirm={confirmDelete}
        description={`Feeder ${deleting?.code} will be removed permanently. A feeder that still has connected areas cannot be deleted.`} />
    </>
  );
}
