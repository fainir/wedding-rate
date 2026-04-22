import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import {
  createToken,
  getCookieOptions,
  COOKIE_NAME,
  verifyToken,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// Max field lengths
const MAX = {
  coupleName: 120,
  location: 200,
  vendorName: 100,
  vendorDesc: 500,
  email: 254,
  password: 128,
  name: 100,
  vendors: 30, // max vendors per wedding
};

function generateSlug(coupleName: string): string {
  const base = coupleName
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);
  const random = Math.random().toString(36).slice(2, 8);
  return `${base || "wedding"}-${random}`;
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 weddings per hour per IP
  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(`create-wedding:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const body = await request.json();

    // Validate + sanitise inputs
    const coupleName = String(body.coupleName ?? "")
      .trim()
      .slice(0, MAX.coupleName);
    const weddingDate = body.weddingDate
      ? String(body.weddingDate).slice(0, 10)
      : null;
    const location = body.location
      ? String(body.location).trim().slice(0, MAX.location)
      : null;

    if (!coupleName) {
      return NextResponse.json(
        { error: "coupleName is required." },
        { status: 400 }
      );
    }

    const rawVendors = Array.isArray(body.contractors)
      ? body.contractors.slice(0, MAX.vendors)
      : [];
    if (rawVendors.length === 0) {
      return NextResponse.json(
        { error: "At least one vendor is required." },
        { status: 400 }
      );
    }

    type VendorRow = { category: string; name: string; description: string | null };
    const vendors: VendorRow[] = rawVendors.map(
      (v: { category?: string; name?: string; description?: string }) => ({
        category: String(v.category ?? "other").slice(0, 50),
        name: String(v.name ?? "").trim().slice(0, MAX.vendorName),
        description: v.description
          ? String(v.description).trim().slice(0, MAX.vendorDesc)
          : null,
      })
    );

    if (vendors.some((v) => !v.name)) {
      return NextResponse.json(
        { error: "All vendors must have a name." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Resolve user_id
    let userId: number | null = null;
    let newToken: string | null = null;

    // Check existing session
    const sessionToken = request.cookies.get(COOKIE_NAME)?.value;
    if (sessionToken) {
      const session = verifyToken(sessionToken);
      if (session) userId = session.userId;
    }

    // Create account if requested and not already logged in
    if (!userId && body.account) {
      const acct = body.account;
      const accEmail = String(acct.email ?? "")
        .trim()
        .toLowerCase()
        .slice(0, MAX.email);
      const accPassword = String(acct.password ?? "").slice(0, MAX.password);
      const accName = String(acct.name ?? "").trim().slice(0, MAX.name);

      if (accEmail && accPassword && accName && accPassword.length >= 8) {
        const existing = db
          .prepare("SELECT id FROM users WHERE email = ?")
          .get(accEmail);
        if (existing) {
          return NextResponse.json(
            { error: "An account with this email already exists." },
            { status: 409 }
          );
        }
        const hash = await bcrypt.hash(accPassword, 12);
        const result = db
          .prepare(
            "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)"
          )
          .run(accEmail, accName, hash);
        userId = result.lastInsertRowid as number;
        newToken = createToken({ userId, email: accEmail, name: accName });
      }
    }

    // Generate a unique slug
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
      .run(slug, coupleName, weddingDate, location, userId);

    const weddingId = weddingResult.lastInsertRowid as number;

    // Insert vendors in a transaction
    const insertVendor = db.prepare(
      "INSERT INTO contractors (wedding_id, category, name, description) VALUES (?, ?, ?, ?)"
    );
    db.transaction(() => {
      for (const v of vendors) {
        insertVendor.run(weddingId, v.category, v.name, v.description);
      }
    })();

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
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
