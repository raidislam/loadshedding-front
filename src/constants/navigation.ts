import {
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  FilePlus,
  History,
  LayoutDashboard,
  ListChecks,
  Map,
  MapPin,
  Settings,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Sidebar menu for each role. A role only ever sees its own menu.
export const NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Distribution Zones", href: "/admin/zones", icon: MapPin },
    { label: "Substations", href: "/admin/substations", icon: Building2 },
    { label: "Feeders", href: "/admin/feeders", icon: Zap },
    { label: "Areas", href: "/admin/areas", icon: Map },
    { label: "Outage Management", href: "/admin/outages", icon: AlertTriangle },
    { label: "Customer Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  CUSTOMER: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Report Outage", href: "/dashboard/report-outage", icon: FilePlus },
    { label: "My Reports", href: "/dashboard/my-reports", icon: ListChecks },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ],
  TECHNICIAN: [
    { label: "Dashboard", href: "/technician", icon: LayoutDashboard },
    { label: "Assigned Jobs", href: "/technician/jobs", icon: Briefcase },
    { label: "Job History", href: "/technician/history", icon: History },
    { label: "Notifications", href: "/technician/notifications", icon: Bell },
    { label: "Profile", href: "/technician/profile", icon: User },
  ],
};

// Where each role lands after login.
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  CUSTOMER: "/dashboard",
  TECHNICIAN: "/technician",
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  CUSTOMER: "Customer",
  TECHNICIAN: "Technician",
};

// Public pages that use the dark electric theme. The navbar and footer switch
// to their dark variants on these routes.
export const DARK_PUBLIC_ROUTES = ["/", "/about", "/services", "/contact", "/outage-status"];

export function isDarkPublicRoute(pathname: string) {
  return DARK_PUBLIC_ROUTES.includes(pathname);
}
