import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  callBackend,
  clearAuthCookies,
  REFRESH_COOKIE,
  refreshTokens,
  setAuthCookies,
} from "@/lib/server/backend";

// Every API call from the browser goes through here:
//   browser -> /api/backend/zones?page=1 -> https://<backend>/api/v1/zones?page=1
// This route adds the access token from the httpOnly cookie.
// If the token has expired (401), it refreshes it once and retries.

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params;
  const target = `/${path.join("/")}${request.nextUrl.search}`;

  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const init: RequestInit = {
    method: request.method,
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? await request.text() : undefined,
  };

  // The access cookie lives 15 minutes. If it is gone but we still have a refresh token, refresh first.
  let newTokens: { accessToken: string; refreshToken: string } | null = null;
  if (!accessToken && refreshToken) {
    newTokens = await refreshTokens(refreshToken);
    accessToken = newTokens?.accessToken;
  }

  let result = await callBackend(target, init, accessToken);

  // Token rejected (expired): refresh once and try again
  if (result.status === 401 && refreshToken && !newTokens) {
    newTokens = await refreshTokens(refreshToken);
    if (newTokens) {
      result = await callBackend(target, init, newTokens.accessToken);
    }
  }

  const res = NextResponse.json(result.json, { status: result.status });

  if (newTokens) {
    setAuthCookies(res, newTokens);
  } else if (result.status === 401 && refreshToken) {
    // Refresh failed too: the session is over
    clearAuthCookies(res);
  }

  return res;
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST };
