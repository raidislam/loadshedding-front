"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { FeederFormDialog } from "@/components/admin/FeederFormDialog";
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
import type { Feeder, Substation, Zone } from "@/types/api";

export function FeedersManager() {
  const queryClient = useQueryClient();
  const { get, page } = useUrlFilters();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Feeder | undefined>();
  const [deleting, setDeleting] = useState<Feeder | null>(null);

  const zoneFilter = get("zone");
  const { data: zones = [] } = useOptions<Zone>("zones", { sortBy: "name", sortOrder: "asc" });
  const { data: substations = [] } = useOptions<Substation>("substations", { sortBy: "name", sortOrder: "asc" });
  const { data, isLoading, error } = useList<Feeder>("feeders", {
    page,
    limit: 10,
    searchTerm: get("q") || undefined,
    zoneId: zoneFilter || undefined,
    substationId: get("substation") || undefined,
    sortBy: "name",
    sortOrder: "asc",
  });

  const remove = useMutation({
    mutationFn: (f: Feeder) => api(`/feeders/${f.id}`, { method: "DELETE" }),
    onSuccess: (_, f) => {
      queryClient.invalidateQueries({ queryKey: ["feeders"] });
      queryClient.invalidateQueries({ queryKey: ["substations"] });
      toast.success(`Feeder "${f.name}" deleted.`);
    },
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: () => setDeleting(null),
  });

  const columns: Column<Feeder>[] = [
    {
      header: "Feeder",
      cell: (f) => (
        <Link href={`/admin/feeders/${f.id}`} className="font-medium text-primary hover:underline">
          {f.name}
        </Link>
      ),
    },
    { header: "Code", cell: (f) => f.code },
    {
      header: "Substation",
      cell: (f) =>
        f.substation ? (
          <div>
            <Link href={`/admin/substations/${f.substation.id}`} className="hover:underline">
              {f.substation.name}
            </Link>
            <p className="text-xs text-muted-foreground">{f.substation.zone.name}</p>
          </div>
        ) : (
          "-"
        ),
    },
    { header: "Voltage", cell: (f) => (f.voltageKV ? `${f.voltageKV} kV` : "-"), className: "hidden md:table-cell" },
    { header: "Areas", cell: (f) => f._count?.areas ?? 0 },
    {
      header: "Actions",
      className: "text-right",
      cell: (f) => (
        <RowActions
          label={f.name}
          viewHref={`/admin/feeders/${f.id}`}
          onEdit={() => {
            setEditing(f);
            setFormOpen(true);
          }}
          onDelete={() => setDeleting(f)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Feeders"
        description="Feeder lines carry power from a substation to the areas."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus /> Add feeder
          </Button>
        }
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search by name or code"
          filters={[
            { key: "zone", label: "All zones", options: zones.map((z) => ({ value: z.id, label: z.name })) },
            {
              key: "substation",
              label: "All substations",
              options: substations
                .filter((s) => !zoneFilter || s.zoneId === zoneFilter)
                .map((s) => ({ value: s.id, label: s.name })),
            },
          ]}
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(f) => f.id}
            loading={isLoading}
            emptyTitle="No feeders found"
            emptyDescription="Try a different search or filter, or add a new feeder."
          />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>

      <FeederFormDialog key={editing?.id ?? "new"} open={formOpen} onOpenChange={setFormOpen} feeder={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        destructive
        loading={remove.isPending}
        title="Delete this feeder?"
        confirmLabel="Delete feeder"
        onConfirm={() => deleting && remove.mutate(deleting)}
        description={`"${deleting?.name}" will be hidden everywhere (soft delete). A feeder that still has areas can't be deleted.`}
      />
    </>
  );
}
