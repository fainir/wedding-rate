import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? verifyToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = getDb();
  const reviews = db
    .prepare(
      `SELECT
         r.id, r.rating, r.review_text, r.created_at,
         c.name AS contractor_name, c.category AS contractor_category,
         w.couple_name, w.slug
       FROM reviews r
       JOIN contractors c ON r.contractor_id = c.id
       JOIN weddings w ON r.wedding_id = w.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`
    )
    .all(session.userId);

  return NextResponse.json({ reviews });
}
