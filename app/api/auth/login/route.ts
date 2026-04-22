import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createToken, getCookieOptions, COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import type { User } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Rate limit: 5 login attempts per 15 minutes per IP
  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
    const password = String(body.password ?? "").slice(0, 128);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as User | undefined;

    // Always run bcrypt even if user not found — prevents timing attacks
    const dummyHash =
      "$2b$12$invalidsaltinvalidsaltinvalidsaltinvalidsaltinval";
    const valid = await bcrypt.compare(
      password,
      user?.password_hash ?? dummyHash
    );

    if (!user || !valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    const res = NextResponse.json({
      user: { userId: user.id, email: user.email, name: user.name },
    });
    res.cookies.set(
      COOKIE_NAME,
      token,
      getCookieOptions(process.env.NODE_ENV === "production")
    );
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
