import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Wedding, Contractor } from "@/lib/db";

export async function GET(
  _request: NextRequest,
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

    const contractors = db
      .prepare(
        "SELECT * FROM contractors WHERE wedding_id = ? ORDER BY created_at ASC"
      )
      .all(wedding.id) as Contractor[];

    return NextResponse.json({ wedding, contractors });
  } catch (err) {
    console.error("Get wedding error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
