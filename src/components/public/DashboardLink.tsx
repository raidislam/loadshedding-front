"use client";

import Link from "next/link";
import { useAuth } from "@/components/layout/AuthProvider";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_HOME } from "@/constants/navigation";

// "Go to my dashboard" for a logged-in user, "Log in" for a visitor.
export function DashboardLink() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  return user ? (
    <Link href={ROLE_HOME[user.role]} className={buttonVariants({ variant: "outline" })}>Go to my dashboard</Link>
  ) : (
    <Link href="/login" className={buttonVariants({ variant: "outline" })}>Log in</Link>
  );
}
