"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { NAV_ITEMS, ROLE_LABEL } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface SidebarProps {
  role: Role;
  onNavigate?: () => void; // used by the mobile menu to close itself
}

// The three role home pages must only be "active" on an exact match,
// otherwise "Dashboard" would stay highlighted on every sub page.
const ROOT_PATHS = ["/admin", "/dashboard", "/technician"];

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (ROOT_PATHS.includes(href)) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4"
      >
        <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary">
          <Zap className="size-4 text-sidebar-primary-foreground" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold">PowerGrid BD</span>
          <span className="block text-xs text-sidebar-foreground/70">
            {ROLE_LABEL[role]} Panel
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main menu">
        {NAV_ITEMS[role].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <p className="border-t border-sidebar-border px-5 py-3 text-xs text-sidebar-foreground/60">
        Demo data only
      </p>
    </div>
  );
}
