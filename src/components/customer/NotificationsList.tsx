"use client";

import { useCallback, useState } from "react";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { useRequiredUser } from "@/components/layout/AuthProvider";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NOTIFICATION_TYPE } from "@/constants/notifications";
import { useLoad } from "@/hooks/useLoad";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatDateTime } from "@/lib/format";
import { paginate } from "@/lib/paginate";
import { cn } from "@/lib/utils";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notifications";

export function NotificationsList() {
  const user = useRequiredUser();
  const loader = useCallback(() => getNotifications(user.id), [user.id]);
  const { data, loading, error, reload } = useLoad(loader);
  const { get, page } = useUrlFilters();
  const [busy, setBusy] = useState(false);

  const all = data ?? [];
  const unreadCount = all.filter((n) => !n.read).length;
  const rows = all
    .filter((n) => !get("type") || n.type === get("type"))
    .filter((n) => !get("read") || (get("read") === "UNREAD" ? !n.read : n.read));
  const paged = paginate(rows, page);

  async function markOne(id: string) {
    await markNotificationRead(id);
    reload();
  }

  async function markAll() {
    setBusy(true);
    try {
      await markAllNotificationsRead(user.id);
      toast.success("All notifications marked as read.");
      reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Notifications" description={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.` : "You are all caught up."}
        actions={<Button variant="outline" disabled={unreadCount === 0 || busy} onClick={markAll}><CheckCheck /> Mark all as read</Button>} />
      <Card className="gap-0 py-0">
        <SearchFilterBar showSearch={false}
          filters={[
            { key: "type", label: "All types", options: Object.entries(NOTIFICATION_TYPE).map(([value, t]) => ({ value, label: t.label })) },
            { key: "read", label: "Read and unread", options: [{ value: "UNREAD", label: "Unread only" }, { value: "READ", label: "Read only" }] },
          ]} />
        {error ? <p className="p-6 text-destructive">{error}</p> : loading ? <TableSkeleton /> : paged.items.length === 0 ? (
          <EmptyState title="No notifications" description="Outage announcements and repair updates will show up here." />
        ) : (
          <ul className="divide-y">
            {paged.items.map((n) => {
              const type = NOTIFICATION_TYPE[n.type];
              return (
                <li key={n.id} className={cn("flex items-start gap-3 p-4", !n.read && "bg-blue-50/60")}>
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", type.className)}><type.icon className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", !n.read && "font-semibold")}>
                      {n.title}
                      {!n.read && <span className="ml-2 inline-block size-2 rounded-full bg-electric align-middle" style={{ backgroundColor: "var(--electric)" }} aria-label="Unread" />}
                    </p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{type.label} · {formatDateTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <Button size="sm" variant="ghost" onClick={() => markOne(n.id)}>Mark as read</Button>}
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={paged.page} totalPages={paged.totalPages} totalItems={paged.totalItems} />
      </Card>
    </>
  );
}
