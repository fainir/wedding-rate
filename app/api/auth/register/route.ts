import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createToken, getCookieOptions, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email.toLowerCase().trim());

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 12);
    const result = db
      .prepare(
        "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)"
      )
      .run(email.toLowerCase().trim(), name.trim(), hash);

    const userId = result.lastInsertRowid as number;
    const token = createToken({ userId, email: email.toLowerCase().trim(), name: name.trim() });

    const res = NextResponse.json(
      { user: { userId, email, name } },
      { status: 201 }
    );
    res.cookies.set(
      COOKIE_NAME,
      token,
      getCookieOptions(process.env.NODE_ENV === "production")
    );
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
