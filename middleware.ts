import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/products",
    "/api/products/admin",
    "/api/products/:id",
    "/api/upload",
    "/api/orders",
    "/api/orders/:path*",
  ],
};

/** Check if the request carries a valid ADMIN_API_KEY.
 *  Accepted in two ways:
 *    1. Query param:  /admin?key=<ADMIN_API_KEY>
 *    2. HTTP header:  Authorization: Bearer <ADMIN_API_KEY>
 */
function hasValidApiKey(req: NextRequest): boolean {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) return false; // key not configured → feature disabled

  // Check query param
  const queryKey = req.nextUrl.searchParams.get("key");
  if (queryKey && queryKey === apiKey) return true;

  // Check Authorization: Bearer <key>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader === `Bearer ${apiKey}`) return true;

  return false;
}

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

  // Allow access via static API key (any device, any network).
  if (hasValidApiKey(req)) {
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
