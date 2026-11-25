"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
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
import { useList, useOptions } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { api, errorMessage } from "@/lib/api";
import type { Area, Zone } from "@/types/api";

export function AreasManager() {
  const queryClient = useQueryClient();
  const { get, page } = useUrlFilters();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Area | undefined>();
  const [deleting, setDeleting] = useState<Area | null>(null);

  const { data: zones = [] } = useOptions<Zone>("zones", { sortBy: "name", sortOrder: "asc" });
  // searchTerm also matches the feeder, substation and zone names (backend)
  const { data, isLoading, error } = useList<Area>("areas", {
    page,
    limit: 10,
    searchTerm: get("q") || undefined,
    zoneId: get("zone") || undefined,
    sortBy: "name",
    sortOrder: "asc",
  });

  const remove = useMutation({
    mutationFn: (a: Area) => api(`/areas/${a.id}`, { method: "DELETE" }),
    onSuccess: (_, a) => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      queryClient.invalidateQueries({ queryKey: ["feeders"] });
      toast.success(`Area "${a.name}" deleted.`);
    },
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: () => setDeleting(null),
  });

  const columns: Column<Area>[] = [
    {
      header: "Area",
      cell: (a) => (
        <Link href={`/admin/areas/${a.id}`} className="font-medium text-primary hover:underline">
          {a.name}
        </Link>
      ),
    },
    { header: "Code", cell: (a) => a.code },
    {
      header: "Feeder",
      cell: (a) => (
        <Link href={`/admin/feeders/${a.feeder.id}`} className="hover:underline">
          {a.feeder.name}
        </Link>
      ),
    },
    { header: "Substation", cell: (a) => a.feeder.substation.name, className: "hidden md:table-cell" },
    { header: "Zone", cell: (a) => a.feeder.substation.zone.name, className: "hidden md:table-cell" },
    {
      header: "Actions",
      className: "text-right",
      cell: (a) => (
        <RowActions
          label={a.name}
          viewHref={`/admin/areas/${a.id}`}
          onEdit={() => {
            setEditing(a);
            setFormOpen(true);
          }}
          onDelete={() => setDeleting(a)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Areas"
        description="Neighbourhoods served by a feeder. Customers and outages belong to an area."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus /> Add area
          </Button>
        }
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search area, feeder, substation or zone"
          filters={[{ key: "zone", label: "All zones", options: zones.map((z) => ({ value: z.id, label: z.name })) }]}
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(a) => a.id}
            loading={isLoading}
            emptyTitle="No areas found"
            emptyDescription="Try a different search or zone, or add a new area."
          />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>

      <AreaFormDialog key={editing?.id ?? "new"} open={formOpen} onOpenChange={setFormOpen} area={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        destructive
        loading={remove.isPending}
        title="Delete this area?"
        confirmLabel="Delete area"
        onConfirm={() => deleting && remove.mutate(deleting)}
        description={`"${deleting?.name}" will be hidden everywhere (soft delete). An area with customers, active outages or open reports can't be deleted.`}
      />
    </>
  );
}
