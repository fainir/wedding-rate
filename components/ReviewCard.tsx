import { StarRating } from "./StarRating";

interface ReviewCardProps {
  reviewerName?: string | null;
  rating: number;
  text?: string | null;
  date: string;
  anonymous: string;
}

export function ReviewCard({
  reviewerName,
  rating,
  text,
  date,
  anonymous,
}: ReviewCardProps) {
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-ivory rounded-xl px-4 py-3 border border-wedding-border/60">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-bold text-xs shrink-0">
            {reviewerName ? reviewerName[0].toUpperCase() : "?"}
          </div>
          <span className="text-sm font-medium text-wedding-text">
            {reviewerName || anonymous}
          </span>
        </div>
        <span className="text-xs text-wedding-muted shrink-0">{formattedDate}</span>
      </div>
      <StarRating value={rating} readonly size="sm" />
      {text && (
        <p className="mt-2 text-sm text-wedding-muted leading-relaxed">{text}</p>
      )}
    </div>
  );
}
