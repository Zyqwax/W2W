"use client";

import { useState } from "react";
import { X } from "lucide-react";
import dayjs from "dayjs";

export default function PastDateModal({ onConfirm, onClose, t }) {
  const today = dayjs().format("YYYY-MM-DD");
  const [date, setDate] = useState(today);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-text">{t("movie.chooseWatchDate")}</h2>
          <button type="button" aria-label={t("common.cancel")} onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-muted transition hover:text-text">
            <X size={16} />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted">{t("movie.watchedDateQuestion")}</p>
        <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="mb-5 min-h-12 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text focus-visible:ring-2 focus-visible:ring-accent" />
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="min-h-12 flex-1 rounded-xl border border-border bg-surface-2 text-sm font-semibold text-text transition hover:bg-surface">{t("common.cancel")}</button>
          <button type="button" onClick={() => onConfirm(date)} disabled={!date} className="min-h-12 flex-1 rounded-xl bg-accent text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50">{t("common.save")}</button>
        </div>
      </div>
    </div>
  );
}
