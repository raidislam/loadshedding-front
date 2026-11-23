import { type NextRequest, NextResponse } from "next/server";

// Next.js 16 "proxy" (this used to be called middleware).
// Runs before a page loads and redirects early:
//  - not logged in + protected page  -> /login
//  - wrong role (e.g. customer opens /admin) -> that user's own dashboard
//  - already logged in + /login or /register -> dashboard
// This is only a quick check on the cookie. The real security is the backend,
// which checks the JWT and the role on every API request.

const ROLE_HOME = { ADMIN: "/admin", CUSTOMER: "/dashboard", TECHNICIAN: "/technician" } as const;
type Role = keyof typeof ROLE_HOME;

const SECTION_ROLE: Record<string, Role> = {
  "/admin": "ADMIN",
  "/dashboard": "CUSTOMER",
  "/technician": "TECHNICIAN",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("ls_role")?.value as Role | undefined;
  const hasSession = !!role && role in ROLE_HOME && request.cookies.has("ls_refresh");

  const section = Object.keys(SECTION_ROLE).find((s) => pathname === s || pathname.startsWith(`${s}/`));

  if (section) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (SECTION_ROLE[section] !== role) {
      return NextResponse.redirect(new URL(ROLE_HOME[role as Role], request.url));
    }
  }

  if ((pathname === "/login" || pathname === "/register") && hasSession) {
    return NextResponse.redirect(new URL(ROLE_HOME[role as Role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/technician/:path*", "/login", "/register"],
};
