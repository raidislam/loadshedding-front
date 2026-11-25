"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api";

// Bell icon in the header with the number of unread notifications.
// It checks again every minute so new notifications show up without a reload.
export function NotificationBell({ href }: { href: string }) {
  const { data: unread = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => (await api("/notifications", { query: { limit: 1, unreadOnly: "true" } })).meta?.unreadCount ?? 0,
    refetchInterval: 60_000,
  });

  return (
    <Link
      href={href}
      className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
    >
      <Bell />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
