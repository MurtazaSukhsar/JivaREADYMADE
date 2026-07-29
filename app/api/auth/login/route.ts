import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`login:${ip}`, { limit: 8, windowMs: 5 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const hashEnv = process.env.ADMIN_PASSWORD_HASH;
  if (!hashEnv) {
    return NextResponse.json(
      { error: "Admin login isn't configured yet. Set ADMIN_PASSWORD_HASH in .env.local." },
      { status: 500 }
    );
  }

  // The hash is stored base64-encoded in the env file. Next's env loader
  // performs shell-style variable expansion on "$" in .env values, which
  // silently mangles a raw bcrypt hash like "$2a$10$..." (it treats "$2a",
  // "$10" etc. as variable references and strips them). Base64 avoids the
  // character entirely.
  const hash = Buffer.from(hashEnv, "base64").toString("utf-8");

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a password." }, { status: 400 });
  }

  const valid = await bcrypt.compare(parsed.data.password, hash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
