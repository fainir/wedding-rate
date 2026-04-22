"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  if (readonly) {
    return (
      <div className="star-rating" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${sizeClasses[size]} leading-none`}
            style={{ color: star <= value ? "#c9963c" : "#e4d9c8" }}
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className="star-rating"
      onMouseLeave={() => setHovered(0)}
      role="radiogroup"
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${sizeClasses[size]}`}
          style={{ color: star <= display ? "#c9963c" : "#d1b896" }}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHovered(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          aria-pressed={value === star}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ rating, count }: { rating: number; count?: number }) {
  const rounded = Math.round(rating * 10) / 10;
  return (
    <div className="flex items-center gap-2">
      <StarRating value={Math.round(rating)} readonly size="sm" />
      <span className="text-sm font-semibold text-gold-700">{rounded}</span>
      {count !== undefined && (
        <span className="text-xs text-wedding-muted">({count})</span>
      )}
    </div>
  );
}
