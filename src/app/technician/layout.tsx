import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function TechnicianLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="TECHNICIAN">{children}</DashboardShell>;
}
