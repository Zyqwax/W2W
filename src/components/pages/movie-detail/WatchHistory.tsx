import { CalendarDays, History, X } from "lucide-react";
import dayjs from "dayjs";
import { getLanguageConfig } from "@/lib/i18n";

export default function WatchHistory({ history, language, onRemove, t }) {
  if (!history.length) return null;
  return <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-8">
    <div className="flex items-center gap-2 mb-4"><History size={16} className="text-rose-400" /><h3 className="text-sm font-semibold text-white">{t("movie.history")}</h3><span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-full">{history.length}×</span></div>
    <ul className="space-y-2">{history.map((entry, idx) => <li key={idx} className="flex items-center justify-between gap-3 bg-zinc-950 rounded-xl px-3 py-2.5 group">
      <div className="flex items-center gap-3"><div className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0"><CalendarDays size={12} className="text-rose-400" /></div><div><p className="text-xs font-semibold text-white">{dayjs(entry.ts).locale(getLanguageConfig(language).dayjs).format("D MMMM YYYY")}</p><p className="text-[10px] text-zinc-500">{dayjs(entry.ts).locale(getLanguageConfig(language).dayjs).fromNow()}</p></div></div>
      <button onClick={() => onRemove(idx)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all" title={t("movie.removeRecord")}><X size={12} /></button>
    </li>)}</ul>
  </div>;
}
