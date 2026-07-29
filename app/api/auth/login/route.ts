import { NextRequest, NextResponse } from "next/server";
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase integration is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  try {
    const resAuth = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
      },
      body: JSON.stringify({
        email: parsed.data.email,
        password: parsed.data.password,
      }),
    });

    const authData = await resAuth.json();

    if (!resAuth.ok) {
      return NextResponse.json(
        { error: authData.error_description ?? authData.error ?? "Incorrect email or password." },
        { status: 401 }
      );
    }

    const userEmail = authData.user?.email;
    const adminEmail = process.env.ADMIN_EMAIL;

    // Optional but recommended: restrict admin panel access to a specific email
    if (adminEmail && userEmail !== adminEmail) {
      return NextResponse.json(
        { error: "Access denied. You are not configured as an administrator." },
        { status: 403 }
      );
    }

    // Success -> generate standard local session cookie
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
  } catch (err) {
    return NextResponse.json(
      { error: "Auth connection failed. Verify your Supabase URL in your configuration." },
      { status: 502 }
    );
  }
}
