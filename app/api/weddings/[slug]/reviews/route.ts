import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import type { Wedding, Review } from "@/lib/db";

const MAX_TEXT = 1000;
const MAX_NAME = 100;

// GET — fetch reviews for the wedding (with optional guestToken check)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();

    const wedding = db
      .prepare("SELECT * FROM weddings WHERE slug = ?")
      .get(slug) as Wedding | undefined;

    if (!wedding) {
      return NextResponse.json(
        { error: "Wedding not found." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const guestToken = searchParams.get("guestToken")?.slice(0, 64);

    if (guestToken) {
      const myReviews = db
        .prepare(
          "SELECT * FROM reviews WHERE wedding_id = ? AND guest_token = ?"
        )
        .all(wedding.id, guestToken) as Review[];
      return NextResponse.json({
        hasReviewed: myReviews.length > 0,
        myReviews,
      });
    }

    const reviews = db
      .prepare(
        "SELECT * FROM reviews WHERE wedding_id = ? ORDER BY created_at DESC"
      )
      .all(wedding.id) as Review[];

    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("Get reviews error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST — submit reviews
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limit: 20 review submissions per minute per IP
  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(`reviews:${ip}`, 20, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const { slug } = await params;
    const db = getDb();

    const wedding = db
      .prepare("SELECT * FROM weddings WHERE slug = ?")
      .get(slug) as Wedding | undefined;

    if (!wedding) {
      return NextResponse.json(
        { error: "Wedding not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const guestToken = body.guestToken
      ? String(body.guestToken).slice(0, 64)
      : null;

    const rawReviews = Array.isArray(body.reviews)
      ? body.reviews.slice(0, 50) // cap to 50 reviews per submission
      : [];

    if (rawReviews.length === 0) {
      return NextResponse.json(
        { error: "No reviews provided." },
        { status: 400 }
      );
    }

    // Get session user if logged in
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const session = token ? verifyToken(token) : null;
    const userId = session?.userId ?? null;

    // Validate contractor IDs belong to this wedding
    const validIds = new Set(
      (
        db
          .prepare("SELECT id FROM contractors WHERE wedding_id = ?")
          .all(wedding.id) as { id: number }[]
      ).map((r) => r.id)
    );

    const insert = db.prepare(
      `INSERT INTO reviews
         (contractor_id, wedding_id, rating, review_text, reviewer_name, user_id, guest_token)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    let inserted = 0;
    db.transaction(() => {
      for (const r of rawReviews) {
        const contractorId = Number(r.contractorId);
        const rating = Number(r.rating);

        if (!validIds.has(contractorId)) continue;
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) continue;

        const reviewText = r.reviewText
          ? String(r.reviewText).trim().slice(0, MAX_TEXT)
          : null;
        const reviewerName = r.reviewerName
          ? String(r.reviewerName).trim().slice(0, MAX_NAME)
          : null;

        // Duplicate check — one review per contractor per guest OR per user
        if (guestToken) {
          const dup = db
            .prepare(
              "SELECT id FROM reviews WHERE contractor_id = ? AND guest_token = ?"
            )
            .get(contractorId, guestToken);
          if (dup) continue;
        }
        if (userId) {
          const dup = db
            .prepare(
              "SELECT id FROM reviews WHERE contractor_id = ? AND user_id = ?"
            )
            .get(contractorId, userId);
          if (dup) continue;
        }

        insert.run(
          contractorId,
          wedding.id,
          rating,
          reviewText,
          reviewerName,
          userId,
          guestToken
        );
        inserted++;
      }
    })();

    return NextResponse.json({ ok: true, inserted });
  } catch (err) {
    console.error("Submit reviews error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
