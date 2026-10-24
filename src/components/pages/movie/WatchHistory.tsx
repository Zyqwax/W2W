import { X } from "lucide-react";
import dayjs from "dayjs";
import { getLanguageConfig } from "@/lib/i18n";

export default function WatchHistory({ history = [], language, onRemove, t }) {
  const locale = getLanguageConfig(language).dayjs;
  const countLabel = language === "tr" ? `${history.length} kez izlendi` : `${history.length} ${history.length === 1 ? "time watched" : "times watched"}`;

  return (
    <section className="border-t border-[--color-border] py-5" aria-labelledby="movie-history-heading">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 id="movie-history-heading" className="font-syne text-base font-semibold text-text">{t("movie.history")}</h2>
        <span className="text-xs text-muted">{countLabel}</span>
      </div>

      {!history.length ? (
        <p className="py-2 text-sm italic text-muted">{language === "tr" ? "Henüz izleme kaydı yok" : "No watch history yet"}</p>
      ) : (
        <ul>
          {history.map((entry, index) => {
            const dateLabel = entry.ts ? dayjs(entry.ts).locale(locale).format("D MMMM YYYY") : t("home.undated");
            const relativeLabel = entry.ts ? dayjs(entry.ts).locale(locale).fromNow() : "";
            return (
              <li key={`${entry.ts || "undated"}-${index}`} className={index > 0 ? "flex items-center gap-3 border-t border-[--color-border]/50 py-2" : "flex items-center gap-3 py-2"}>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[--color-text-faint]" aria-hidden="true" />
                <span className="min-w-0 flex-1 text-sm text-text">{dateLabel}</span>
                {relativeLabel && <span className="hidden shrink-0 text-xs text-muted sm:inline">{relativeLabel}</span>}
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  title={t("movie.removeRecord")}
                  aria-label={t("movie.removeRecord")}
                  className="ml-2 flex min-h-11 min-w-8 items-center justify-center text-[--color-text-faint] transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
