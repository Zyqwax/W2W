"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";

export default function RatingReview({ userData, language, review, saving, onRating, onReviewChange, onSaveReview, t }) {
  const [hoveredRating, setHoveredRating] = useState(0);
  if (userData?.status !== "watched") return null;

  const currentRating = userData.rating || 0;
  const visibleRating = hoveredRating || currentRating;
  const ratingSummary = visibleRating
    ? language === "tr" ? `${visibleRating} / 10 verdin` : `${visibleRating} / 10 given`
    : language === "tr" ? "Henüz puan vermedin" : "You have not rated this film yet";
  const saveLabel = userData.review ? (language === "tr" ? "Güncelle" : "Update") : t("movie.saveNote");

  return (
    <section id="movie-rating" className="border-t border-[--color-border] py-5" aria-labelledby="movie-rating-heading">
      <h2 id="movie-rating-heading" className="mb-4 font-syne text-base font-semibold text-text">{t("movie.rating")}</h2>
      <div className="flex flex-wrap gap-1.5" onMouseLeave={() => setHoveredRating(0)}>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((star) => {
          const isHovered = hoveredRating > 0 && star <= hoveredRating;
          const isFilled = visibleRating >= star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              aria-label={`${star}/10`}
              className="flex min-h-11 min-w-7 items-center justify-center text-[--color-text-faint] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-alt"
            >
              <Star size={28} fill={isFilled ? "currentColor" : "none"} className={isHovered ? "text-accent-alt/60" : isFilled ? "text-accent-alt" : "text-[--color-text-faint]"} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-muted">{ratingSummary}</p>

      <label htmlFor="movie-review" className="mt-4 mb-1.5 block text-xs text-muted">{language === "tr" ? "Notun (opsiyonel)" : "Your note (optional)"}</label>
      <textarea
        id="movie-review"
        value={review}
        onChange={(event) => onReviewChange(event.target.value)}
        placeholder={t("movie.reviewPlaceholder")}
        className="min-h-20 w-full resize-none rounded-[var(--radius-md)] border border-[--color-border] bg-transparent p-3 text-sm text-text outline-none placeholder:text-[--color-text-faint] focus:border-accent focus:ring-1 focus:ring-accent"
      />
      {review !== (userData.review || "") && <Button onClick={onSaveReview} loading={saving} className="mt-3 min-h-11 bg-transparent px-0 text-sm font-medium text-accent hover:bg-transparent hover:text-accent/80">{saveLabel}</Button>}
    </section>
  );
}
