"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { ROLE_HOME } from "@/constants/navigation";

// On login / register pages: if someone is already logged in, send them to their dashboard.
export function useRedirectIfLoggedIn() {
  const router = useRouter();
  const { user, ready } = useAuth();
  useEffect(() => {
    if (ready && user) router.replace(ROLE_HOME[user.role]);
  }, [ready, user, router]);
}
