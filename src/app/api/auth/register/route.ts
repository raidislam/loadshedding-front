import { NextResponse } from "next/server";
import { callBackend, type LoginResult, setAuthCookies } from "@/lib/server/backend";

// POST /api/auth/register -> creates a CUSTOMER account and logs it in
export async function POST(request: Request) {
  const body = await request.text();

  const { status, json } = await callBackend("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (status !== 201) {
    return NextResponse.json(json, { status });
  }

  const { user, accessToken, refreshToken } = json.data as LoginResult;
  const res = NextResponse.json({ success: true, message: json.message, data: { user } }, { status: 201 });
  setAuthCookies(res, { accessToken, refreshToken }, user.role);
  return res;
}
