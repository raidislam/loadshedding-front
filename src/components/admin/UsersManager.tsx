"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/layout/AuthProvider";
import { UserFormDialog } from "@/components/admin/UserFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { USER_STATUS, toOptions } from "@/constants/labels";
import { ROLE_LABEL } from "@/constants/navigation";
import { useList } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Role, User } from "@/types/api";

const ROLE_OPTIONS = Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }));

export function UsersManager() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const { get, page } = useUrlFilters();
  const [addOpen, setAddOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [statusUser, setStatusUser] = useState<User | null>(null);

  // GET /admin/users - search by name/email/phone/meter, filter by role and status
  const { data, isLoading, error } = useList<User>("admin/users", {
    page,
    limit: 10,
    role: get("role") || undefined,
    status: get("status") || undefined,
    searchTerm: get("q") || undefined,
  });

  // PATCH /admin/users/:id/block  { status: "BLOCKED" | "ACTIVE" }
  const changeStatus = useMutation({
    mutationFn: (u: User) =>
      api<User>(`/admin/users/${u.id}/block`, { method: "PATCH", body: { status: u.status === "ACTIVE" ? "BLOCKED" : "ACTIVE" } }),
    onSuccess: (res) => {
      toast.success(`${res.data.name} is now ${res.data.status === "BLOCKED" ? "blocked" : "active"}.`);
      queryClient.invalidateQueries({ queryKey: ["admin/users"] });
      setStatusUser(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const columns: Column<User>[] = [
    {
      header: "Name",
      cell: (u) => (
        <div>
          <p className="font-medium">{u.name}{u.id === me?.id && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    { header: "Role", cell: (u) => ROLE_LABEL[u.role] },
    { header: "Phone", cell: (u) => u.phone ?? "-", className: "hidden md:table-cell" },
    { header: "Area", cell: (u) => u.area?.name ?? "-", className: "hidden lg:table-cell" },
    { header: "Joined", cell: (u) => formatDate(u.createdAt), className: "hidden lg:table-cell" },
    { header: "Status", cell: (u) => <StatusBadge {...USER_STATUS[u.status]} /> },
    {
      header: "Actions",
      className: "text-right",
      cell: (u) => {
        // The backend does not allow an admin to change their own role or block themselves
        const self = u.id === me?.id;
        return (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" disabled={self} onClick={() => setRoleUser(u)}>Change role</Button>
            <Button size="sm" variant={u.status === "ACTIVE" ? "destructive" : "default"} disabled={self} onClick={() => setStatusUser(u)}>
              {u.status === "ACTIVE" ? "Block" : "Unblock"}
            </Button>
          </div>
        );
      },
    },
  ];

  const blocking = statusUser?.status === "ACTIVE";

  return (
    <>
      <PageHeader
        title="User Management"
        description="Everyone who can sign in. Customers register themselves; technicians are added here."
        actions={<Button onClick={() => setAddOpen(true)}><Plus /> Add technician</Button>}
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search name, email, phone or meter"
          filters={[
            { key: "role", label: "All roles", options: ROLE_OPTIONS },
            { key: "status", label: "All statuses", options: toOptions(USER_STATUS) },
          ]}
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable columns={columns} rows={data?.data ?? []} getRowId={(u) => u.id} loading={isLoading}
            emptyTitle="No users found" emptyDescription="Try a different search or filter." />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>

      <UserFormDialog open={addOpen} onOpenChange={setAddOpen} />

      <FormDialog open={!!roleUser} onOpenChange={(o) => !o && setRoleUser(null)} title="Change role"
        description={roleUser ? `${roleUser.name} will be logged out and must sign in again.` : undefined}>
        {roleUser && <ChangeRoleForm key={roleUser.id} user={roleUser} onDone={() => setRoleUser(null)} />}
      </FormDialog>

      <ConfirmDialog
        open={!!statusUser}
        onOpenChange={(o) => !o && setStatusUser(null)}
        loading={changeStatus.isPending}
        destructive={blocking}
        title={blocking ? "Block this account?" : "Unblock this account?"}
        confirmLabel={blocking ? "Block" : "Unblock"}
        description={blocking ? `${statusUser?.name} will be logged out and cannot sign in.` : `${statusUser?.name} will be able to sign in again.`}
        onConfirm={() => statusUser && changeStatus.mutate(statusUser)}
      />
    </>
  );
}

// PATCH /admin/users/:id/role  { role }
function ChangeRoleForm({ user, onDone }: { user: User; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<Role>(user.role);

  const save = useMutation({
    mutationFn: () => api<User>(`/admin/users/${user.id}/role`, { method: "PATCH", body: { role } }),
    onSuccess: (res) => {
      toast.success(`${res.data.name} is now ${ROLE_LABEL[res.data.role]}.`);
      queryClient.invalidateQueries({ queryKey: ["admin/users"] });
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
      <FormField label="New role" htmlFor="role-select">
        <SimpleSelect id="role-select" value={role} onChange={(v) => setRole(v as Role)} options={ROLE_OPTIONS} />
      </FormField>
      <p className="text-sm text-muted-foreground">
        A technician with active jobs cannot be moved to another role, and the last admin cannot be demoted.
      </p>
      <Button type="submit" className="h-9 w-full" disabled={save.isPending || role === user.role}>
        {save.isPending ? "Saving..." : "Save role"}
      </Button>
    </form>
  );
}
