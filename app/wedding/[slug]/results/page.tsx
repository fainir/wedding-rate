import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { StarDisplay } from "@/components/StarRating";
import { ReviewCard } from "@/components/ReviewCard";
import { getDb } from "@/lib/db";
import { getServerT } from "@/lib/serverTranslations";

interface ContractorWithReviews {
  id: number;
  category: string;
  name: string;
  description: string | null;
  avgRating: number;
  count: number;
  reviews: {
    id: number;
    reviewer_name: string | null;
    rating: number;
    review_text: string | null;
    created_at: string;
  }[];
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

async function getResultsData(slug: string) {
  const db = getDb();

  const wedding = db
    .prepare("SELECT * FROM weddings WHERE slug = ?")
    .get(slug) as
    | {
        id: number;
        couple_name: string;
        wedding_date: string | null;
        location: string | null;
      }
    | undefined;

  if (!wedding) return null;

  const contractors = db
    .prepare(
      "SELECT * FROM contractors WHERE wedding_id = ? ORDER BY created_at ASC"
    )
    .all(wedding.id) as {
    id: number;
    category: string;
    name: string;
    description: string | null;
  }[];

  const results: ContractorWithReviews[] = contractors.map((c) => {
    const reviews = db
      .prepare(
        "SELECT id, reviewer_name, rating, review_text, created_at FROM reviews WHERE contractor_id = ? ORDER BY created_at DESC"
      )
      .all(c.id) as {
      id: number;
      reviewer_name: string | null;
      rating: number;
      review_text: string | null;
      created_at: string;
    }[];

    const count = reviews.length;
    const avgRating =
      count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    return { ...c, avgRating, count, reviews };
  });

  return { wedding, results };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [data, { t }] = await Promise.all([
    getResultsData(slug),
    getServerT(),
  ]);

  if (!data) notFound();

  const { wedding, results } = data;
  const totalReviews = results.reduce((s, c) => s + c.count, 0);
  const ratedContractors = results.filter((c) => c.count > 0);
  const overallAvg =
    ratedContractors.length > 0
      ? ratedContractors.reduce((s, c) => s + c.avgRating, 0) /
        ratedContractors.length
      : 0;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Wedding header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📊</div>
          <h1
            className="text-3xl font-bold text-wedding-text mb-1"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {wedding.couple_name}
          </h1>
          {(wedding.wedding_date || wedding.location) && (
            <p className="text-sm text-wedding-muted mb-3">
              {wedding.wedding_date &&
                new Date(wedding.wedding_date).toLocaleDateString()}{" "}
              {wedding.location && `· ${wedding.location}`}
            </p>
          )}

          {/* Summary pill */}
          <div className="inline-flex items-center gap-3 bg-gold-50 border border-gold-200 rounded-2xl px-6 py-3">
            {overallAvg > 0 && (
              <>
                <StarDisplay rating={overallAvg} />
                <div className="w-px h-8 bg-gold-200" />
              </>
            )}
            <div>
              <p className="text-2xl font-bold text-gold-700">{totalReviews}</p>
              <p className="text-xs text-wedding-muted">{t.results.totalReviews}</p>
            </div>
          </div>

          <div className="gold-divider my-5 max-w-xs mx-auto" />
        </div>

        {/* Nav row */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href={`/wedding/${slug}`}
            className="text-sm text-gold-600 hover:text-gold-800 flex items-center gap-1"
          >
            ← {t.results.backToRating}
          </Link>
          <h2
            className="text-xl font-bold text-wedding-text"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {t.results.title}
          </h2>
          <div />
        </div>

        {/* Contractor cards */}
        <div className="space-y-6">
          {results.map((c) => (
            <section
              key={c.id}
              className="bg-white rounded-2xl border border-wedding-border overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-wedding-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_EMOJI[c.category] ?? "🌟"}</span>
                  <div>
                    <p className="font-bold text-wedding-text">{c.name}</p>
                    <p className="text-xs text-gold-600 uppercase tracking-widest">
                      {t.categories[c.category] ?? c.category}
                    </p>
                  </div>
                </div>
                {c.count > 0 ? (
                  <div className="text-end shrink-0">
                    <StarDisplay rating={c.avgRating} count={c.count} />
                  </div>
                ) : (
                  <span className="text-xs text-wedding-muted italic">
                    {t.results.noReviews}
                  </span>
                )}
              </div>

              {c.reviews.length > 0 ? (
                <div className="divide-y divide-wedding-border/40">
                  {c.reviews.map((r) => (
                    <div key={r.id} className="px-5 py-3">
                      <ReviewCard
                        reviewerName={r.reviewer_name}
                        rating={r.rating}
                        text={r.review_text}
                        date={r.created_at}
                        anonymous={t.results.anonymous}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-4 text-sm text-wedding-muted italic">
                  {t.results.noReviews}
                </p>
              )}
            </section>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href={`/wedding/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-white font-semibold rounded-full hover:bg-gold-600 transition-colors"
          >
            ⭐ {t.results.leaveReview}
          </Link>
        </div>
      </main>
    </>
  );
}
