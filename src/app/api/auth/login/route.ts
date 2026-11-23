import { NextResponse } from "next/server";
import { callBackend, type LoginResult, setAuthCookies } from "@/lib/server/backend";

// POST /api/auth/login { email, password }
// Logs in on the backend, saves the tokens in httpOnly cookies and returns only the user.
export async function POST(request: Request) {
  const body = await request.text();

  const { status, json } = await callBackend("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (status !== 200) {
    return NextResponse.json(json, { status });
  }

  const { user, accessToken, refreshToken } = json.data as LoginResult;
  const res = NextResponse.json({ success: true, message: json.message, data: { user } });
  setAuthCookies(res, { accessToken, refreshToken }, user.role);
  return res;
}
