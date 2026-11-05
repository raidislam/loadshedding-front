"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getNotifications, NOTIFICATIONS_CHANGED } from "@/services/notifications";

// Bell icon in the header with the number of unread notifications.
export function NotificationBell({ userId }: { userId: string }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    function load() {
      getNotifications(userId).then((list) => {
        if (!cancelled) setUnread(list.filter((n) => !n.read).length);
      });
    }
    load();
    window.addEventListener(NOTIFICATIONS_CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(NOTIFICATIONS_CHANGED, load);
    };
  }, [userId]);

  return (
    <Link
      href="/dashboard/notifications"
      className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
    >
      <Bell />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white">
          {unread}
        </span>
      )}
    </Link>
  );
}
