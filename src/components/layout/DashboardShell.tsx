"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ROLE_HOME } from "@/constants/navigation";
import type { Role } from "@/types";

interface DashboardShellProps {
  role: Role; // the only role allowed to see this section
  children: ReactNode;
}

// Shared layout for Admin, Customer and Technician sections:
// sidebar (desktop) + mobile menu + header + route protection.
export function DashboardShell({ role, children }: DashboardShellProps) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Frontend-only route protection (demo). Real apps must check on the server.
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(ROLE_HOME[user.role]);
  }, [ready, user, role, router]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen" role="status" aria-label="Loading">
        <Skeleton className="hidden h-screen w-64 rounded-none lg:block" />
        <div className="flex-1 space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar role={role} />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-64 gap-0 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SheetDescription className="sr-only">Links to every page in this section</SheetDescription>
          <Sidebar role={role} onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <Header user={user} onMenuClick={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-7xl p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
