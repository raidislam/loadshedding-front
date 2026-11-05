"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/layout/AuthProvider";
import { UserFormDialog } from "@/components/admin/UserFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROLE_LABEL } from "@/constants/navigation";
import { useLoad } from "@/hooks/useLoad";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatDate } from "@/lib/format";
import { paginate } from "@/lib/paginate";
import { getAreas } from "@/services/areas";
import { getUsers, setUserActive } from "@/services/users";
import { getZones } from "@/services/zones";
import { getTechnicians } from "@/services/technicians";
import type { User } from "@/types";

async function loadData() {
  const [users, areas, zones, technicians] = await Promise.all([getUsers(), getAreas(), getZones(), getTechnicians()]);
  return { users, areas, zones, technicians };
}

export function UsersManager() {
  const { user: me } = useAuth();
  const { data, loading, error, reload } = useLoad(loadData);
  const { get, page } = useUrlFilters();
  const [formOpen, setFormOpen] = useState(false);
  const [toggling, setToggling] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  const areas = data?.areas ?? [];
  const zones = data?.zones ?? [];
  const location = (u: User) => {
    if (u.role === "CUSTOMER") return areas.find((a) => a.id === u.areaId)?.name ?? "-";
    if (u.role === "TECHNICIAN") {
      const zoneId = data?.technicians.find((t) => t.userId === u.id)?.zoneId;
      return zones.find((z) => z.id === zoneId)?.name ?? "-";
    }
    return "Head office";
  };

  const q = get("q").toLowerCase();
  const rows = (data?.users ?? [])
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .filter((u) => !get("role") || u.role === get("role"))
    .filter((u) => !get("status") || (get("status") === "ACTIVE") === u.active);
  const paged = paginate(rows, page);

  async function confirmToggle() {
    if (!toggling) return;
    setBusy(true);
    try {
      await setUserActive(toggling.id, !toggling.active);
      toast.success(`${toggling.name} is now ${toggling.active ? "deactivated" : "active"}.`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the user.");
    } finally {
      setBusy(false);
      setToggling(null);
    }
  }

  const columns: Column<User>[] = [
    { header: "Name", cell: (u) => (<div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>) },
    { header: "Role", cell: (u) => ROLE_LABEL[u.role] },
    { header: "Area / zone", cell: location, className: "hidden md:table-cell" },
    { header: "Joined", cell: (u) => formatDate(u.createdAt), className: "hidden lg:table-cell" },
    { header: "Status", cell: (u) => <StatusBadge label={u.active ? "Active" : "Inactive"} tone={u.active ? "success" : "neutral"} /> },
    {
      header: "Action", className: "text-right",
      cell: (u) => (
        <Button size="sm" variant={u.active ? "outline" : "default"} disabled={u.id === me?.id}
          title={u.id === me?.id ? "You cannot deactivate your own account" : undefined}
          onClick={() => setToggling(u)}>
          {u.active ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="User Management" description="Everyone who can sign in to the system."
        actions={<Button onClick={() => setFormOpen(true)}><Plus /> Add user</Button>} />
      <Card className="gap-0 py-0">
        <SearchFilterBar searchPlaceholder="Search name or email"
          filters={[
            { key: "role", label: "All roles", options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })) },
            { key: "status", label: "All statuses", options: [{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }] },
          ]} />
        {error ? <p className="p-6 text-destructive">{error}</p> : (
          <DataTable columns={columns} rows={paged.items} getRowId={(u) => u.id} loading={loading}
            emptyTitle="No users found" emptyDescription="Try a different search or filter." />
        )}
        <Pagination page={paged.page} totalPages={paged.totalPages} totalItems={paged.totalItems} />
      </Card>

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} zones={zones} areas={areas} onSaved={reload} />
      <ConfirmDialog open={!!toggling} onOpenChange={(o) => !o && setToggling(null)} loading={busy}
        destructive={toggling?.active} title={toggling?.active ? "Deactivate this account?" : "Activate this account?"}
        confirmLabel={toggling?.active ? "Deactivate" : "Activate"} onConfirm={confirmToggle}
        description={toggling?.active ? `${toggling?.name} will no longer be able to log in.` : `${toggling?.name} will be able to log in again.`} />
    </>
  );
}
