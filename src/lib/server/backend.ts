import "server-only";
import type { NextResponse } from "next/server";
import type { Role, User } from "@/types/api";

// Runs only on the Next.js server (route handlers, server components, proxy).
// The browser never talks to the backend directly and never sees the tokens.

export const BACKEND_URL = process.env.BACKEND_API_URL ?? "https://loadsheeding-backend.vercel.app/api/v1";

// Cookie names. The tokens are httpOnly, so JavaScript in the browser can't read them (protects against XSS).
export const ACCESS_COOKIE = "ls_access";
export const REFRESH_COOKIE = "ls_refresh";
export const ROLE_COOKIE = "ls_role"; // not secret: read by proxy.ts and the browser

const isProduction = process.env.NODE_ENV === "production";
const baseCookie = { httpOnly: true, secure: isProduction, sameSite: "lax" as const, path: "/" };

// Same lifetimes as the backend tokens
const ACCESS_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export const setAuthCookies = (res: NextResponse, tokens: { accessToken: string; refreshToken: string }, role?: Role) => {
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
  // The role is not a secret, so the browser may read it (to know quickly if someone is logged in)
  if (role) res.cookies.set(ROLE_COOKIE, role, { ...baseCookie, httpOnly: false, maxAge: REFRESH_MAX_AGE });
};

export const clearAuthCookies = (res: NextResponse) => {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE]) {
    res.cookies.set(name, "", { ...baseCookie, maxAge: 0 });
  }
};

// Calls the backend and returns its status + JSON body
export const callBackend = async (path: string, init: RequestInit = {}, accessToken?: string) => {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${BACKEND_URL}${path}`, { ...init, headers, cache: "no-store" });
  const json = await res.json().catch(() => ({ success: false, message: "Invalid response from server", errors: [] }));

  // Never pass a server stack trace on to the browser (the backend only sends one in development mode)
  if (json && typeof json === "object") delete json.stack;

  return { status: res.status, json };
};

// Uses the refresh token to get a new token pair. Returns null if the session is over.
export const refreshTokens = async (refreshToken: string) => {
  const { status, json } = await callBackend("/auth/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (status !== 200) return null;
  return json.data as { accessToken: string; refreshToken: string };
};

export type LoginResult = { user: User; accessToken: string; refreshToken: string };
