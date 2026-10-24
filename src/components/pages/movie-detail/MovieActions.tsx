import { CalendarDays, CheckCircle, Forward, PlusCircle, RotateCcw, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

export default function MovieActions({ userData, saving, onWatchNow, onWatchPast, onWatchNoDate, onUpdateStatus, onRemove, onRecommend, customLists = [], onAddToCustomList, t }) {
  const [selectedListId, setSelectedListId] = useState("");
  const [listStatus, setListStatus] = useState("idle");

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

  return (
    <>
      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <button id="watch-now-btn" onClick={onWatchNow} disabled={saving} className="flex min-h-11 flex-1 items-center justify-center gap-2.25 rounded-[10px] bg-gold px-5.5 py-3 font-body text-sm font-bold text-gold-ink transition hover:-translate-y-px hover:brightness-[1.08] disabled:opacity-50">
            {userData?.status === "watched" ? <span className="flex items-center gap-2"><RotateCcw size={17} /><span>{t("movie.watchedAgain")}</span></span> : <span className="flex items-center gap-2"><CheckCircle size={18} /><span>{t("movie.actionsWatched")}</span></span>}
          </button>
          <button id="watch-past-btn" onClick={onWatchPast} disabled={saving} className="flex min-h-11 flex-1 items-center justify-center gap-2.25 rounded-[10px] border border-white/16 bg-transparent px-4 py-3 font-body text-sm font-bold text-ivory transition hover:-translate-y-px hover:bg-ivory/4 disabled:opacity-50"><CalendarDays size={17} />{userData?.status === "watched" ? t("movie.pastDate") : t("movie.chooseDate")}</button>
        </div>
        <button onClick={onWatchNoDate} disabled={saving} className="flex min-h-11 w-full items-center justify-center gap-2.25 rounded-[10px] border border-white/16 bg-transparent px-4 py-3 font-body text-sm font-bold text-ivory transition hover:-translate-y-px hover:bg-ivory/4 disabled:opacity-50"><CheckCircle size={14} />{t("movie.noDate")}</button>
        <div className="flex gap-2 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
          {!userData ? <button onClick={() => onUpdateStatus("wishlist")} disabled={saving} className="flex min-h-11 flex-1 items-center justify-center gap-2.25 rounded-[10px] bg-gold px-5.5 py-3 font-body text-sm font-bold text-gold-ink transition hover:-translate-y-px hover:brightness-[1.08] disabled:opacity-50"><PlusCircle size={18} /> {t("movie.addWishlist")}</button> : <div className="w-full flex items-center justify-between px-2">
            <span className={clsx("text-sm font-medium flex items-center gap-2", userData.status === "watched" ? "text-emerald-500" : "text-amber-500")}>{userData.status === "watched" ? <CheckCircle size={18} /> : <PlusCircle size={18} />}{userData.status === "watched" ? t("profile.watched") : t("movie.inWishlist")}</span>
            <button onClick={onRemove} disabled={saving} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition"><Trash2 size={18} /></button>
          </div>}
        </div>
      </div>
      {customLists.length > 0 && (
        <div className="flex gap-2">
          <select value={selectedListId} onChange={(event) => { setSelectedListId(event.target.value); setListStatus("idle"); }} className="min-h-11 min-w-0 flex-1 rounded-[10px] border border-white/16 bg-surface1 px-3 text-xs text-ivory outline-none">
            <option value="" disabled>{t("movie.chooseList")}</option>
            {customLists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
          </select>
          <button type="button" onClick={handleAddToList} disabled={!selectedListId || listStatus === "saving"} className="min-h-11 rounded-[10px] border border-white/16 px-3 text-xs font-bold text-ivory hover:bg-ivory/5 disabled:opacity-50">{t("movie.addToList")}</button>
        </div>
      )}
      {listStatus !== "idle" && <p className={clsx("text-xs", listStatus === "error" ? "text-rose-400" : "text-gold")} role="status">{listStatus === "saving" ? t("common.saving") : listStatus === "saved" ? t("lists.added") : t("common.error")}</p>}
      {/* Recommend */}
      <button onClick={onRecommend} className="flex min-h-11 w-full items-center justify-center gap-2.25 rounded-[10px] border border-white/16 bg-transparent px-4 py-3 font-body text-sm font-bold text-ivory transition hover:-translate-y-px hover:bg-ivory/4 disabled:opacity-50"><Forward size={17} />{t("movie.recommend")}</button>
    </>
  );
}
