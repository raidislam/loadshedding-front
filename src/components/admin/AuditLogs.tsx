"use client";

import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { Card } from "@/components/ui/card";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, actionLabel } from "@/constants/labels";
import { ROLE_LABEL } from "@/constants/navigation";
import { useList } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { AuditLog } from "@/types/api";

export function AuditLogs() {
  const { get, page } = useUrlFilters();
  // GET /admin/audit-logs - read-only history of important changes (newest first)
  const { data, isLoading, error } = useList<AuditLog>("admin/audit-logs", {
    page,
    limit: 15,
    action: get("action") || undefined,
    entityType: get("entity") || undefined,
  });

  const columns: Column<AuditLog>[] = [
    { header: "When", cell: (l) => <span className="whitespace-nowrap text-sm">{formatDateTime(l.createdAt)}</span> },
    { header: "Action", cell: (l) => <span className="font-medium">{actionLabel(l.action)}</span> },
    {
      header: "Record",
      className: "hidden md:table-cell",
      cell: (l) => (
        <div>
          <p className="text-sm">{l.entityType}</p>
          {l.entityId && <p className="font-mono text-xs text-muted-foreground">{l.entityId.slice(0, 8)}…</p>}
        </div>
      ),
    },
    {
      header: "Done by",
      cell: (l) =>
        l.user ? (
          <div>
            <p className="text-sm">{l.user.name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABEL[l.user.role]}</p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">System</span>
        ),
    },
    {
      header: "Details",
      className: "hidden lg:table-cell",
      cell: (l) =>
        l.details && Object.keys(l.details).length > 0 ? (
          <ul className="max-w-xs space-y-0.5 text-xs text-muted-foreground">
            {Object.entries(l.details).map(([key, value]) => (
              <li key={key} className="truncate">
                <span className="font-medium text-foreground">{key}:</span> {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </li>
            ))}
          </ul>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <>
      <PageHeader title="Audit Log" description="Who changed what and when. Entries cannot be edited or deleted." />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          showSearch={false}
          filters={[
            { key: "action", label: "All actions", options: AUDIT_ACTIONS.map((a) => ({ value: a, label: actionLabel(a) })) },
            { key: "entity", label: "All records", options: AUDIT_ENTITY_TYPES.map((t) => ({ value: t, label: t })) },
          ]}
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable columns={columns} rows={data?.data ?? []} getRowId={(l) => l.id} loading={isLoading}
            emptyTitle="No log entries" emptyDescription="Try a different filter." />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>
    </>
  );
}
