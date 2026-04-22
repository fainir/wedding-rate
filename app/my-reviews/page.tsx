import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { Header } from "@/components/Header";
import { StarRating } from "@/components/StarRating";
import { getDb } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

interface ReviewRow {
  id: number;
  rating: number;
  review_text: string | null;
  reviewer_name: string | null;
  created_at: string;
  contractor_name: string;
  contractor_category: string;
  couple_name: string;
  slug: string;
}

async function getUserReviews(userId: number): Promise<ReviewRow[]> {
  const db = getDb();
  return db
    .prepare(
      `SELECT
        r.id, r.rating, r.review_text, r.reviewer_name, r.created_at,
        c.name AS contractor_name, c.category AS contractor_category,
        w.couple_name, w.slug
       FROM reviews r
       JOIN contractors c ON r.contractor_id = c.id
       JOIN weddings w ON r.wedding_id = w.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`
    )
    .all(userId) as ReviewRow[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  dj: "🎵",
  photographer: "📸",
  venue: "🏛️",
  caterer: "🍽️",
  planner: "📋",
  makeup: "💄",
  florist: "💐",
  band: "🎸",
  videographer: "🎬",
  lighting: "💡",
  invitations: "✉️",
  rabbi: "✡️",
  dress: "👗",
  suit: "👔",
  transport: "🚌",
  cake: "🎂",
};

export default async function MyReviewsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = token ? verifyToken(token) : null;

  if (!session) {
    redirect("/login");
  }

  const reviews = await getUserReviews(session.userId);

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1
          className="text-3xl font-bold text-wedding-text mb-2"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          My Reviews
        </h1>
        <p className="text-wedding-muted text-sm mb-8">
          Hi {session.name} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </p>

        {reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-wedding-muted mb-4">
              You haven&apos;t written any reviews yet.
            </p>
            <p className="text-sm text-wedding-muted">
              Visit a wedding link to leave reviews for vendors.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-wedding-border p-5 card-hover"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">
                      {CATEGORY_EMOJI[r.contractor_category] ?? "🌟"}
                    </span>
                    <div>
                      <p className="font-bold text-wedding-text">
                        {r.contractor_name}
                      </p>
                      <p className="text-xs text-gold-600 uppercase tracking-widest">
                        {r.contractor_category}
                      </p>
                      <Link
                        href={`/wedding/${r.slug}/results`}
                        className="text-xs text-wedding-muted hover:text-gold-600 transition-colors mt-0.5 block"
                      >
                        💍 {r.couple_name}
                      </Link>
                    </div>
                  </div>
                  <span className="text-xs text-wedding-muted shrink-0">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <StarRating value={r.rating} readonly size="sm" />
                {r.review_text && (
                  <p className="mt-2 text-sm text-wedding-muted leading-relaxed italic">
                    &ldquo;{r.review_text}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
