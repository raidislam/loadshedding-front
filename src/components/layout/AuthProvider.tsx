"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, type ReactNode } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Role, User } from "@/types/api";

// The role cookie (ls_role) is set by our login route. It is not secret;
// it only tells the browser that someone is logged in. The real tokens are httpOnly.
function hasSessionCookie() {
  return document.cookie.split("; ").some((c) => c.startsWith("ls_role="));
}

// One-click demo accounts (filled in .env.local, must exist in the backend database)
const DEMO_ACCOUNTS: Record<Role, { email?: string; password?: string }> = {
  ADMIN: { email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL, password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD },
  CUSTOMER: { email: process.env.NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL, password: process.env.NEXT_PUBLIC_DEMO_CUSTOMER_PASSWORD },
  TECHNICIAN: {
    email: process.env.NEXT_PUBLIC_DEMO_TECHNICIAN_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_TECHNICIAN_PASSWORD,
  },
};

// Loads the logged-in user once when the app starts
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!hasSessionCookie()) {
      setUser(null);
      return;
    }
    // Plain fetch (not api()) so a visitor with an old cookie isn't sent to /login
    fetch("/api/backend/users/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setUser(json?.data ?? null))
      .catch(() => setUser(null));
  }, [setUser]);

  return children;
}

// Sends { email, password } to our login route, which stores the tokens in httpOnly cookies
async function postAuth(path: "/api/auth/login" | "/api/auth/register", body: unknown): Promise<User> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new ApiError(json?.message ?? "Request failed. Please try again.", res.status, json?.errors ?? []);
  }
  return json.data.user as User;
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const login = useCallback(
    async (email: string, password: string) => {
      const loggedIn = await postAuth("/api/auth/login", { email, password });
      queryClient.clear(); // never show the previous user's cached data
      setUser(loggedIn);
      return loggedIn;
    },
    [queryClient, setUser],
  );

  const loginAs = useCallback(
    async (role: Role) => {
      const demo = DEMO_ACCOUNTS[role];
      if (!demo.email || !demo.password) {
        throw new Error(`Demo ${role.toLowerCase()} account is not configured.`);
      }
      return login(demo.email, demo.password);
    },
    [login],
  );

  const register = useCallback(
    async (input: Record<string, unknown>) => {
      const created = await postAuth("/api/auth/register", input);
      queryClient.clear();
      setUser(created);
      return created;
    },
    [queryClient, setUser],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    queryClient.clear();
    setUser(null);
  }, [queryClient, setUser]);

  // PATCH /users/me and keep the store in sync
  const updateProfile = useCallback(
    async (patch: Partial<Pick<User, "name" | "phone" | "address" | "meterNumber" | "areaId">>) => {
      const { data } = await api<User>("/users/me", { method: "PATCH", body: patch });
      setUser(data);
      return data;
    },
    [setUser],
  );

  return { user, ready, login, loginAs, register, logout, updateProfile };
}

// For pages inside a dashboard layout: the layout only shows them to a logged-in user.
export function useRequiredUser(): User {
  const user = useAuthStore((s) => s.user);
  if (!user) throw new Error("useRequiredUser must be used on a page that needs login");
  return user;
}
