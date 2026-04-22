"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { StarRating } from "./StarRating";
import type { Contractor } from "@/lib/db";

interface ReviewState {
  rating: number;
  text: string;
}

interface ContractorCardProps {
  contractor: Contractor;
  value: ReviewState;
  onChange: (rating: number, text: string) => void;
  submitted?: boolean;
}

export function ContractorCard({
  contractor,
  value,
  onChange,
  submitted,
}: ContractorCardProps) {
  const { t, isRtl } = useLanguage();
  const emoji =
    {
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
    }[contractor.category] ?? "🌟";

  const categoryLabel =
    t.categories[contractor.category] ?? contractor.category;

  return (
    <div
      className="bg-white rounded-2xl border border-wedding-border p-5 card-hover"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl shrink-0">{emoji}</span>
        <div>
          <p className="text-xs font-medium text-gold-600 uppercase tracking-widest mb-0.5">
            {categoryLabel}
          </p>
          <h3 className="text-lg font-bold text-wedding-text leading-snug">
            {contractor.name}
          </h3>
          {contractor.description && (
            <p className="text-sm text-wedding-muted mt-1">
              {contractor.description}
            </p>
          )}
        </div>
      </div>

      {submitted ? (
        <div className="flex items-center gap-2 mt-2">
          <StarRating value={value.rating} readonly size="md" />
          {value.text && (
            <p className="text-sm text-wedding-muted italic">&ldquo;{value.text}&rdquo;</p>
          )}
        </div>
      ) : (
        <>
          {/* Star rating */}
          <div className="mb-3">
            <StarRating
              value={value.rating}
              onChange={(r) => onChange(r, value.text)}
              size="lg"
            />
            {value.rating === 0 && (
              <p className="text-xs text-wedding-muted mt-1">{t.wedding.selectRating}</p>
            )}
          </div>

          {/* Review text */}
          <textarea
            value={value.text}
            onChange={(e) => onChange(value.rating, e.target.value)}
            placeholder={t.wedding.writeReview}
            rows={2}
            className="w-full text-sm rounded-xl border border-wedding-border bg-ivory px-3 py-2 resize-none placeholder:text-wedding-muted/60 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors"
            dir={isRtl ? "rtl" : "ltr"}
          />
        </>
      )}
    </div>
  );
}
