"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { CalendarDays, Check, CheckCircle2, Heart, ListPlus, MessageCircle, RotateCcw, Star, Trash2 } from "lucide-react";
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
  const watchedAt = userData?.watchedAt ?? userData?.watchHistory?.find((entry) => entry.ts)?.ts;
  const watchedDate = watchedAt ? dayjs(watchedAt).locale(getLanguageConfig(language).dayjs).format("D MMM YYYY") : null;

  const toggleWishlist = () => inWishlist ? onRemove() : onUpdateStatus("wishlist");

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

  const subtleButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/60 px-3 text-sm font-medium text-text transition hover:border-accent/50 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-wait disabled:opacity-50";

  return (
    <section aria-labelledby="movie-actions-heading">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">W2W</p>
        <h2 id="movie-actions-heading" className="mt-1 font-syne text-xl font-bold text-text">{language === "tr" ? "Kütüphanene ekle" : "Your library"}</h2>
        {watched ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-success"><CheckCircle2 size={15} aria-hidden="true" />{watchedDate || t("profile.watched")}</p>
        ) : inWishlist ? (
          <p className="mt-2 text-sm text-muted">{t("movie.inWishlist")}</p>
        ) : (
          <p className="mt-2 text-sm leading-5 text-muted">{language === "tr" ? "İzleme durumunu ve kişisel notlarını kaydet." : "Track your watch history and personal notes."}</p>
        )}
      </div>

      <div className="space-y-2.5">
        <button type="button" onClick={onWatchNow} disabled={saving} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-bg shadow-lg shadow-accent/10 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-wait disabled:opacity-60">
          {watched ? <RotateCcw size={17} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
          {watched ? t("movie.watchedAgain") : t("movie.actionsWatched")}
        </button>

        {!watched && <button type="button" onClick={toggleWishlist} disabled={saving} aria-pressed={inWishlist} className={subtleButton + " w-full"}>
          <Heart size={16} fill={inWishlist ? "currentColor" : "none"} className={inWishlist ? "text-accent" : ""} aria-hidden="true" />
          {inWishlist ? t("movie.inWishlist") : t("movie.addWishlist")}
        </button>}

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onWatchPast} disabled={saving} className={subtleButton}>
            <CalendarDays size={16} aria-hidden="true" />{t("movie.chooseDate")}
          </button>
          <button type="button" onClick={onWatchNoDate} disabled={saving} className={subtleButton}>
            <CheckCircle2 size={16} aria-hidden="true" />{t("movie.noDate")}
          </button>
        </div>
      </div>

      {watched && (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
          <button type="button" onClick={onRatingFocus} className={subtleButton}><Star size={16} aria-hidden="true" />{t("movie.rating")}</button>
          <button type="button" onClick={onRecommend} className={subtleButton}><MessageCircle size={16} aria-hidden="true" />{t("movie.recommend")}</button>
        </div>
      )}

      {customLists.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <label htmlFor="movie-custom-list" className="mb-2 block text-xs font-semibold text-muted">{t("movie.addToList")}</label>
          <div className="flex gap-2">
            <select id="movie-custom-list" value={selectedListId} onChange={(event) => { setSelectedListId(event.target.value); setListStatus("idle"); }} className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <option value="" disabled>{t("movie.chooseList")}</option>
              {customLists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
            </select>
            <button type="button" onClick={handleAddToList} disabled={!selectedListId || listStatus === "saving"} aria-label={t("movie.addToList")} className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-border bg-surface-2 text-accent transition hover:border-accent/50 disabled:opacity-50">
              <ListPlus size={18} aria-hidden="true" />
            </button>
          </div>
          {listStatus !== "idle" && <p className={`mt-2 text-xs ${listStatus === "error" ? "text-danger" : "text-success"}`} role="status">{listStatus === "saving" ? t("common.saving") : listStatus === "saved" ? t("lists.added") : t("common.error")}</p>}
        </div>
      )}

      {userData && <button type="button" onClick={onRemove} disabled={saving} className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-muted transition hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:opacity-50">
        <Trash2 size={14} aria-hidden="true" />{t("movie.removeRecord")}
      </button>}
    </section>
  );
}
