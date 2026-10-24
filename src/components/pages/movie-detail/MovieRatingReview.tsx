import { Star } from "lucide-react";
import clsx from "clsx";

export default function MovieRatingReview({ userData, review, saving, onRating, onReviewChange, onSaveReview, t }) {
  if (userData?.status !== "watched") return null;
  return <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
    <h3 className="text-sm font-medium text-zinc-400 mb-4">{t("movie.rating")}</h3>
    <div className="flex items-center gap-1 mb-4">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => <button key={star} onClick={() => onRating(star)} className="focus:outline-none"><Star size={22} className={clsx("transition-colors", (userData.rating || 0) >= star ? "fill-amber-400 text-amber-400" : "text-zinc-700")} /></button>)}</div>
    <textarea value={review} onChange={(e) => onReviewChange(e.target.value)} placeholder={t("movie.reviewPlaceholder")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:ring-1 focus:ring-rose-500 focus:outline-none min-h-25 mb-2" />
    {review !== (userData.review || "") && <button onClick={onSaveReview} disabled={saving} className="w-full py-2 bg-zinc-800 text-white rounded-lg text-sm hover:bg-zinc-700 transition">{saving ? t("common.saving") : t("movie.saveNote")}</button>}
  </div>;
}
