import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import type { Wedding, Review } from "@/lib/db";

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
      return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const guestToken = searchParams.get("guestToken");

    if (guestToken) {
      // Check if this guest already has reviews
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

    // Return all reviews for the wedding
    const reviews = db
      .prepare("SELECT * FROM reviews WHERE wedding_id = ? ORDER BY created_at DESC")
      .all(wedding.id) as Review[];

    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("Get reviews error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST — submit reviews
export async function POST(
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
      return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
    }

    const body = await request.json();
    const { reviews, guestToken } = body as {
      reviews: {
        contractorId: number;
        rating: number;
        reviewText?: string;
        reviewerName?: string;
      }[];
      guestToken?: string;
    };

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: "No reviews provided." }, { status: 400 });
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
      `INSERT OR IGNORE INTO reviews
       (contractor_id, wedding_id, rating, review_text, reviewer_name, user_id, guest_token)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    let inserted = 0;
    const insertAll = db.transaction(() => {
      for (const r of reviews) {
        if (!validIds.has(r.contractorId)) continue;
        if (r.rating < 1 || r.rating > 5) continue;

        // Check for duplicate (guest or user)
        if (guestToken) {
          const dup = db
            .prepare(
              "SELECT id FROM reviews WHERE contractor_id = ? AND guest_token = ?"
            )
            .get(r.contractorId, guestToken);
          if (dup) continue;
        }
        if (userId) {
          const dup = db
            .prepare(
              "SELECT id FROM reviews WHERE contractor_id = ? AND user_id = ?"
            )
            .get(r.contractorId, userId);
          if (dup) continue;
        }

        insert.run(
          r.contractorId,
          wedding.id,
          r.rating,
          r.reviewText?.trim() || null,
          r.reviewerName?.trim() || null,
          userId,
          guestToken || null
        );
        inserted++;
      }
    });

    insertAll();

    return NextResponse.json({ ok: true, inserted });
  } catch (err) {
    console.error("Submit reviews error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
