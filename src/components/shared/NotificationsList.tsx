"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NOTIFICATION_TYPE } from "@/constants/notifications";
import { useList } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { api, errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/api";

// Used by all three roles. The backend only ever returns the logged-in user's notifications.
export function NotificationsList() {
  const queryClient = useQueryClient();
  const { get, page } = useUrlFilters();

  const { data, isLoading, error } = useList<Notification>("notifications", {
    page,
    limit: 10,
    unreadOnly: get("show") === "unread" ? "true" : undefined,
  });
  const unreadCount = data?.meta?.unreadCount ?? 0;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] }); // list + bell

  const markOne = useMutation({
    mutationFn: (id: string) => api(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: refresh,
    onError: (e) => toast.error(errorMessage(e)),
  });

  const markAll = useMutation({
    mutationFn: () => api<{ updatedCount: number }>("/notifications/read-all", { method: "PATCH" }),
    onSuccess: ({ data: result }) => {
      toast.success(`${result.updatedCount} notification(s) marked as read.`);
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const rows = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.` : "You are all caught up."}
        actions={
          <Button variant="outline" disabled={unreadCount === 0 || markAll.isPending} onClick={() => markAll.mutate()}>
            <CheckCheck /> Mark all as read
          </Button>
        }
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar showSearch={false} filters={[{ key: "show", label: "Read and unread", options: [{ value: "unread", label: "Unread only" }] }]} />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState title="No notifications" description="Outage news, report updates and payments will show up here." />
        ) : (
          <ul className="divide-y">
            {rows.map((n) => {
              const type = NOTIFICATION_TYPE[n.type];
              return (
                <li key={n.id} className={cn("flex items-start gap-3 p-4", !n.isRead && "bg-blue-50/60 dark:bg-sky-500/5")}>
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", type.className)}>
                    <type.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", !n.isRead && "font-semibold")}>
                      {n.title}
                      {!n.isRead && <span className="ml-2 inline-block size-2 rounded-full bg-blue-600 align-middle" aria-label="Unread" />}
                    </p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {type.label} · {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <Button size="sm" variant="ghost" disabled={markOne.isPending} onClick={() => markOne.mutate(n.id)}>
                      Mark as read
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>
    </>
  );
}
