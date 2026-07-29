import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export const config = {
  matcher: ["/admin/:path*", "/api/products", "/api/upload", "/api/orders", "/api/orders/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login page itself must stay reachable, or nobody could ever log in.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // The product list (GET /api/products) stays public — only creating a
  // product requires a session. /api/orders is never public: it returns
  // customer names, addresses and phone numbers.
  if (pathname === "/api/products" && req.method !== "POST") {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);

  if (valid) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}
