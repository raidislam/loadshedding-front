"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ZoneFormDialog } from "@/components/admin/ZoneFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { RowActions } from "@/components/shared/RowActions";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useList } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Zone } from "@/types/api";

export function ZonesManager() {
  const queryClient = useQueryClient();
  const { get, page } = useUrlFilters();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Zone | undefined>();
  const [deleting, setDeleting] = useState<Zone | null>(null);

  // GET /zones?page=1&limit=10&searchTerm=...  (search and pages are done by the backend)
  const { data, isLoading, error } = useList<Zone>("zones", {
    page,
    limit: 10,
    searchTerm: get("q") || undefined,
    sortBy: get("sort") || "name",
    sortOrder: "asc",
  });

  // DELETE /zones/:id (soft delete). The backend answers 409 if the zone still has substations.
  const remove = useMutation({
    mutationFn: (zone: Zone) => api(`/zones/${zone.id}`, { method: "DELETE" }),
    onSuccess: (_, zone) => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success(`Zone "${zone.name}" deleted.`);
    },
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: () => setDeleting(null),
  });

  const columns: Column<Zone>[] = [
    {
      header: "Zone",
      cell: (z) => (
        <Link href={`/admin/zones/${z.id}`} className="font-medium text-primary hover:underline">
          {z.name}
        </Link>
      ),
    },
    { header: "Code", cell: (z) => z.code },
    { header: "Substations", cell: (z) => z._count?.substations ?? 0 },
    { header: "Description", cell: (z) => z.description || "-", className: "hidden md:table-cell" },
    { header: "Created", cell: (z) => formatDate(z.createdAt), className: "hidden lg:table-cell" },
    {
      header: "Actions",
      className: "text-right",
      cell: (z) => (
        <RowActions
          label={z.name}
          viewHref={`/admin/zones/${z.id}`}
          onEdit={() => {
            setEditing(z);
            setFormOpen(true);
          }}
          onDelete={() => setDeleting(z)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Distribution Zones"
        description="Large regions of the network. Each zone contains substations."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus /> Add zone
          </Button>
        }
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search by name or code"
          filters={[
            {
              key: "sort",
              label: "Sort by name",
              options: [
                { value: "code", label: "Sort by code" },
                { value: "createdAt", label: "Sort by date added" },
              ],
            },
          ]}
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(z) => z.id}
            loading={isLoading}
            emptyTitle="No zones found"
            emptyDescription="Try a different search, or add a new zone."
          />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>

      {/* key: a new form every time the dialog opens for a different zone */}
      <ZoneFormDialog key={editing?.id ?? "new"} open={formOpen} onOpenChange={setFormOpen} zone={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        destructive
        loading={remove.isPending}
        title="Delete this zone?"
        confirmLabel="Delete zone"
        onConfirm={() => deleting && remove.mutate(deleting)}
        description={`"${deleting?.name}" will be hidden everywhere (soft delete). A zone that still has substations can't be deleted.`}
      />
    </>
  );
}
