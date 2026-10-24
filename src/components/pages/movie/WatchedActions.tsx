"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { CalendarDays, Check, CheckCircle2, ListPlus, MessageCircle, Plus, RotateCcw, Star, Trash2 } from "lucide-react";
import { getLanguageConfig } from "@/lib/i18n";

export default function WatchedActions({
  userData,
  language,
  saving,
  onWatchNow,
  onWatchPast,
  onWatchNoDate,
  onUpdateStatus,
  onRemove,
  onRecommend,
  onRatingFocus,
  customLists = [],
  onAddToCustomList,
  t,
}) {
  const [selectedListId, setSelectedListId] = useState("");
  const [listStatus, setListStatus] = useState("idle");
  const watched = userData?.status === "watched";
  const inWishlist = userData?.status === "wishlist";
  const watchedAt = userData?.watchedAt || userData?.watchHistory?.find((entry) => entry.ts)?.ts;
  const watchedDate = watchedAt ? dayjs(watchedAt).locale(getLanguageConfig(language).dayjs).format("D MMM YYYY") : null;

  const handleStatusToggle = () => {
    if (watched) {
      onWatchNow();
      return;
    }
    if (inWishlist) {
      onRemove();
      return;
    }
    onUpdateStatus("wishlist");
  };

  const handleAddToList = async () => {
    if (!selectedListId || !onAddToCustomList) return;
    setListStatus("saving");
    try {
      await onAddToCustomList(selectedListId);
      setListStatus("saved");
    } catch (error) {
      console.error("Add to list error:", error);
      setListStatus("error");
    }
  };

  const secondaryActionClass = "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <section className="border-t border-[--color-border] py-5" aria-label={t("movie.actionsWatched")}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleStatusToggle}
          disabled={saving}
          aria-pressed={watched}
          className={`inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-full)] px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${watched ? "bg-accent text-bg" : "border border-[--color-border] text-text hover:border-accent"}`}
        >
          {watched ? <CheckCircle2 size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {watched ? t("movie.actionsWatched") : t("movie.addWishlist")}
        </button>
        {watchedDate && <span className="text-sm text-muted">{watchedDate}</span>}
        {watched && (
          <button type="button" onClick={onWatchNow} disabled={saving} className="ml-auto min-h-11 text-sm font-medium text-accent underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50">
            <RotateCcw size={15} className="mr-1.5 inline" aria-hidden="true" />
            {t("movie.watchedAgain")}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <button type="button" onClick={onWatchPast} disabled={saving} className={secondaryActionClass}>
          <CalendarDays size={16} aria-hidden="true" />
          {watched ? t("movie.pastDate") : t("movie.chooseDate")}
        </button>
        <span className="text-[--color-text-faint]" aria-hidden="true">·</span>
        <button type="button" onClick={onWatchNoDate} disabled={saving} className={secondaryActionClass}>
          <Check size={15} aria-hidden="true" />
          {t("movie.noDate")}
        </button>
        <span className="text-[--color-text-faint]" aria-hidden="true">·</span>
        <button type="button" onClick={onRatingFocus} className={secondaryActionClass}>
          <Star size={16} aria-hidden="true" />
          {t("movie.rating")}
        </button>
        <span className="text-[--color-text-faint]" aria-hidden="true">·</span>
        <button type="button" onClick={onRecommend} className={secondaryActionClass}>
          <MessageCircle size={16} aria-hidden="true" />
          {t("movie.recommend")}
        </button>
      </div>

      {customLists.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[--color-border] pt-4">
          <label className="sr-only" htmlFor="movie-custom-list">{t("movie.chooseList")}</label>
          <select
            id="movie-custom-list"
            value={selectedListId}
            onChange={(event) => { setSelectedListId(event.target.value); setListStatus("idle"); }}
            className="min-h-11 min-w-48 flex-1 rounded-[var(--radius-md)] border border-[--color-border] bg-transparent px-3 text-xs text-text outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
          >
            <option value="" disabled>{t("movie.chooseList")}</option>
            {customLists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
          </select>
          <button type="button" onClick={handleAddToList} disabled={!selectedListId || listStatus === "saving"} className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs font-medium text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50">
            <ListPlus size={15} aria-hidden="true" />
            {t("movie.addToList")}
          </button>
        </div>
      )}
      {listStatus !== "idle" && <p className={`mt-2 text-xs ${listStatus === "error" ? "text-danger" : "text-success"}`} role="status">{listStatus === "saving" ? t("common.saving") : listStatus === "saved" ? t("lists.added") : t("common.error")}</p>}

      {userData && (
        <button type="button" onClick={onRemove} disabled={saving} className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-danger transition-colors hover:text-danger/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:opacity-50">
          <Trash2 size={14} aria-hidden="true" />
          {t("movie.removeRecord")}
        </button>
      )}
    </section>
  );
}
