import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, callBackend, clearAuthCookies } from "@/lib/server/backend";

// POST /api/auth/logout -> ends the session on the backend and removes the cookies
export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (accessToken) {
    // If the token has already expired this fails, which is fine: cookies are removed anyway
    await callBackend("/auth/logout", { method: "POST" }, accessToken).catch(() => null);
  }

  const res = NextResponse.json({ success: true, message: "Logged out successfully", data: null });
  clearAuthCookies(res);
  return res;
}
