"use client";

import { useState } from "react";
import { X } from "lucide-react";
import dayjs from "dayjs";

export default function PastDateModal({ onConfirm, onClose, t }) {
  const today = dayjs().format("YYYY-MM-DD");
  const [date, setDate] = useState(today);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">{t("movie.chooseWatchDate")}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-zinc-500 mb-4">{t("movie.watchedDateQuestion")}</p>
        <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-rose-500 focus:outline-none mb-5 scheme-dark" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-700 transition">{t("common.cancel")}</button>
          <button onClick={() => onConfirm(date)} disabled={!date} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-500 transition disabled:opacity-50">{t("common.save")}</button>
        </div>
      </div>
    </div>
  );
}
