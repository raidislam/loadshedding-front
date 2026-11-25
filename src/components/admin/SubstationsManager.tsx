"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SubstationFormDialog } from "@/components/admin/SubstationFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { RowActions } from "@/components/shared/RowActions";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useList, useOptions } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { api, errorMessage } from "@/lib/api";
import type { Substation, Zone } from "@/types/api";

export function SubstationsManager() {
  const queryClient = useQueryClient();
  const { get, page } = useUrlFilters();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Substation | undefined>();
  const [deleting, setDeleting] = useState<Substation | null>(null);

  const { data: zones = [] } = useOptions<Zone>("zones", { sortBy: "name", sortOrder: "asc" });
  const { data, isLoading, error } = useList<Substation>("substations", {
    page,
    limit: 10,
    searchTerm: get("q") || undefined,
    zoneId: get("zone") || undefined,
    sortBy: "name",
    sortOrder: "asc",
  });

  const remove = useMutation({
    mutationFn: (s: Substation) => api(`/substations/${s.id}`, { method: "DELETE" }),
    onSuccess: (_, s) => {
      queryClient.invalidateQueries({ queryKey: ["substations"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success(`Substation "${s.name}" deleted.`);
    },
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: () => setDeleting(null),
  });

  const columns: Column<Substation>[] = [
    {
      header: "Substation",
      cell: (s) => (
        <Link href={`/admin/substations/${s.id}`} className="font-medium text-primary hover:underline">
          {s.name}
        </Link>
      ),
    },
    { header: "Code", cell: (s) => s.code },
    {
      header: "Zone",
      cell: (s) =>
        s.zone ? (
          <Link href={`/admin/zones/${s.zone.id}`} className="hover:underline">
            {s.zone.name}
          </Link>
        ) : (
          "-"
        ),
    },
    { header: "Capacity", cell: (s) => (s.capacityMW ? `${s.capacityMW} MW` : "-"), className: "hidden md:table-cell" },
    { header: "Feeders", cell: (s) => s._count?.feeders ?? 0 },
    {
      header: "Actions",
      className: "text-right",
      cell: (s) => (
        <RowActions
          label={s.name}
          viewHref={`/admin/substations/${s.id}`}
          onEdit={() => {
            setEditing(s);
            setFormOpen(true);
          }}
          onDelete={() => setDeleting(s)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Substations"
        description="Each substation belongs to a zone and feeds power into feeders."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus /> Add substation
          </Button>
        }
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search by name or code"
          filters={[{ key: "zone", label: "All zones", options: zones.map((z) => ({ value: z.id, label: z.name })) }]}
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(s) => s.id}
            loading={isLoading}
            emptyTitle="No substations found"
            emptyDescription="Try a different search or zone, or add a new substation."
          />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>

      <SubstationFormDialog key={editing?.id ?? "new"} open={formOpen} onOpenChange={setFormOpen} substation={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        destructive
        loading={remove.isPending}
        title="Delete this substation?"
        confirmLabel="Delete substation"
        onConfirm={() => deleting && remove.mutate(deleting)}
        description={`"${deleting?.name}" will be hidden everywhere (soft delete). A substation that still has feeders can't be deleted.`}
      />
    </>
  );
}
