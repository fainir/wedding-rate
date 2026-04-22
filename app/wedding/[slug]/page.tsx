"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ContractorCard } from "@/components/ContractorCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Contractor, Wedding } from "@/lib/db";

interface ReviewState {
  rating: number;
  text: string;
}

function getOrCreateGuestToken(): string {
  const key = "wr-guest-token";
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

export default function WeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t, isRtl } = useLanguage();
  const { user } = useAuth();

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [reviews, setReviews] = useState<Record<number, ReviewState>>({});
  const [reviewerName, setReviewerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Load wedding data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/weddings/${slug}`);
        if (!res.ok) {
          setError("Wedding not found.");
          return;
        }
        const data = await res.json();
        setWedding(data.wedding);
        setContractors(data.contractors);

        // Initialize review state
        const init: Record<number, ReviewState> = {};
        for (const c of data.contractors) init[c.id] = { rating: 0, text: "" };
        setReviews(init);
      } catch {
        setError("Failed to load wedding page.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  // Check if guest already reviewed
  useEffect(() => {
    if (!contractors.length) return;
    const token = getOrCreateGuestToken();

    async function checkReviewed() {
      const res = await fetch(`/api/weddings/${slug}/reviews?guestToken=${token}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hasReviewed) {
          setAlreadyReviewed(true);
          // Pre-fill with existing reviews
          const pre: Record<number, ReviewState> = {};
          for (const r of data.myReviews ?? []) {
            pre[r.contractor_id] = { rating: r.rating, text: r.review_text ?? "" };
          }
          setReviews((prev) => ({ ...prev, ...pre }));
        }
      }
    }
    checkReviewed();
  }, [slug, contractors]);

  // Pre-fill name from account
  useEffect(() => {
    if (user) setReviewerName(user.name);
  }, [user]);

  async function handleSubmit() {
    const token = getOrCreateGuestToken();
    const reviewList = contractors
      .filter((c) => reviews[c.id]?.rating > 0)
      .map((c) => ({
        contractorId: c.id,
        rating: reviews[c.id].rating,
        reviewText: reviews[c.id].text,
        reviewerName: reviewerName.trim() || null,
      }));

    if (reviewList.length === 0) {
      setError("Please rate at least one vendor.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/weddings/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: reviewList, guestToken: token }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to submit.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-wedding-muted animate-pulse">Loading...</div>
        </div>
      </>
    );
  }

  if (error && !wedding) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <p className="text-2xl">💔</p>
          <p className="text-wedding-muted">{error}</p>
          <Link href="/" className="text-gold-600 hover:underline text-sm">
            ← Back to home
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main
        className="max-w-2xl mx-auto px-4 py-8"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Wedding header */}
        {wedding && (
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">💍</div>
            <h1
              className="text-3xl font-bold text-wedding-text mb-1"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {wedding.couple_name}
            </h1>
            {(wedding.wedding_date || wedding.location) && (
              <p className="text-wedding-muted text-sm">
                {wedding.wedding_date && (
                  <span>
                    {t.wedding.date}:{" "}
                    {new Date(wedding.wedding_date).toLocaleDateString()}
                  </span>
                )}
                {wedding.wedding_date && wedding.location && " · "}
                {wedding.location && (
                  <span>
                    {t.wedding.at} {wedding.location}
                  </span>
                )}
              </p>
            )}
            <div className="gold-divider my-5 max-w-xs mx-auto" />
            <h2 className="text-xl font-semibold text-wedding-text mb-1">
              {t.wedding.rateVendors}
            </h2>
            <p className="text-sm text-wedding-muted">{t.wedding.subtitle}</p>
          </div>
        )}

        {/* Already reviewed */}
        {alreadyReviewed && !submitted && (
          <div className="mb-6 rounded-xl bg-gold-50 border border-gold-200 px-4 py-3 text-sm text-gold-800 text-center">
            {t.wedding.alreadyReviewed}
          </div>
        )}

        {/* Success state */}
        {submitted && (
          <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 px-6 py-5 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-semibold text-green-800 text-lg">
              {t.wedding.thankYou}
            </p>
          </div>
        )}

        {/* Reviewer name */}
        {!submitted && !alreadyReviewed && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-wedding-text mb-1.5">
              {t.wedding.yourName}
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder={t.wedding.yourNamePlaceholder}
              className="w-full rounded-xl border border-wedding-border bg-white px-3 py-2.5 text-sm text-wedding-text placeholder:text-wedding-muted/60 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>
        )}

        {/* Contractors grid */}
        <div className="grid gap-4">
          {contractors.map((c) => (
            <ContractorCard
              key={c.id}
              contractor={c}
              value={reviews[c.id] ?? { rating: 0, text: "" }}
              onChange={(rating, text) =>
                setReviews((prev) => ({ ...prev, [c.id]: { rating, text } }))
              }
              submitted={submitted || alreadyReviewed}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-200">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {!submitted && !alreadyReviewed && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3.5 bg-gold-500 text-white font-bold rounded-full hover:bg-gold-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {submitting ? t.wedding.submitting : `⭐ ${t.wedding.submitAll}`}
            </button>
          )}
          <Link
            href={`/wedding/${slug}/results`}
            className="flex-1 py-3.5 text-center border border-gold-400 text-gold-700 font-semibold rounded-full hover:bg-gold-50 transition-colors"
          >
            📊 {t.wedding.viewResults}
          </Link>
          <button
            onClick={copyLink}
            className="sm:w-auto px-5 py-3.5 border border-wedding-border text-wedding-muted text-sm rounded-full hover:border-gold-400 hover:text-gold-700 transition-colors"
          >
            {copied ? `✓ ${t.wedding.copied}` : `🔗 ${t.wedding.shareLink}`}
          </button>
        </div>
      </main>
    </>
  );
}
