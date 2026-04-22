import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createToken, getCookieOptions, COOKIE_NAME, verifyToken } from "@/lib/auth";

function generateSlug(coupleName: string): string {
  const base = coupleName
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 24)
    .replace(/-+$/, "");
  const random = Math.random().toString(36).slice(2, 8);
  return `${base || "wedding"}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coupleName, weddingDate, location, contractors, account } = body;

    if (!coupleName || !Array.isArray(contractors) || contractors.length === 0) {
      return NextResponse.json(
        { error: "coupleName and at least one contractor are required." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Determine user_id
    let userId: number | null = null;
    let newToken: string | null = null;

    // Check existing session
    const sessionToken = request.cookies.get(COOKIE_NAME)?.value;
    if (sessionToken) {
      const session = verifyToken(sessionToken);
      if (session) userId = session.userId;
    }

    // Create account if requested and not already logged in
    if (!userId && account?.email && account?.password && account?.name) {
      const existing = db
        .prepare("SELECT id FROM users WHERE email = ?")
        .get(account.email.toLowerCase().trim());

      if (existing) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }

      const hash = await bcrypt.hash(account.password, 12);
      const result = db
        .prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)")
        .run(
          account.email.toLowerCase().trim(),
          account.name.trim(),
          hash
        );
      userId = result.lastInsertRowid as number;
      newToken = createToken({
        userId,
        email: account.email.toLowerCase().trim(),
        name: account.name.trim(),
      });
    }

    // Generate unique slug
    let slug = generateSlug(coupleName);
    let attempts = 0;
    while (
      db.prepare("SELECT id FROM weddings WHERE slug = ?").get(slug) &&
      attempts < 10
    ) {
      slug = generateSlug(coupleName);
      attempts++;
    }

    // Insert wedding
    const weddingResult = db
      .prepare(
        "INSERT INTO weddings (slug, couple_name, wedding_date, location, user_id) VALUES (?, ?, ?, ?, ?)"
      )
      .run(slug, coupleName.trim(), weddingDate || null, location || null, userId);

    const weddingId = weddingResult.lastInsertRowid as number;

    // Insert contractors
    const insertContractor = db.prepare(
      "INSERT INTO contractors (wedding_id, category, name, description) VALUES (?, ?, ?, ?)"
    );
    const insertMany = db.transaction(
      (items: { category: string; name: string; description?: string }[]) => {
        for (const item of items) {
          insertContractor.run(weddingId, item.category, item.name.trim(), item.description?.trim() || null);
        }
      }
    );
    insertMany(contractors);

    const res = NextResponse.json({ slug, weddingId }, { status: 201 });
    if (newToken) {
      res.cookies.set(
        COOKIE_NAME,
        newToken,
        getCookieOptions(process.env.NODE_ENV === "production")
      );
    }
    return res;
  } catch (err) {
    console.error("Create wedding error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
