import Image from "next/image";
import { Check, ChevronDown, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  isAired,
  type TvSeason,
  type TvEpisode,
  type EpisodeMark,
} from "@/lib/tv";
export default function SeasonAccordion({
  summary,
  data,
  open,
  loading,
  error,
  marks,
  busy,
  tracked,
  tr,
  onOpen,
  onToggle,
  onBulk,
}: {
  summary: TvSeason;
  data?: TvSeason;
  open: boolean;
  loading: boolean;
  error?: string;
  marks: EpisodeMark[];
  busy: boolean;
  tracked: boolean;
  tr: boolean;
  onOpen: () => void;
  onToggle: (ep: TvEpisode) => void;
  onBulk: (watched: boolean) => void;
}) {
  const watched = (ep: TvEpisode) =>
    marks.some(
      (m) =>
        m.seasonNumber === ep.season_number &&
        m.episodeNumber === ep.episode_number,
    );
  const count = marks.filter(
    (m) => m.seasonNumber === summary.season_number,
  ).length;
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <h3>
        <button
          onClick={onOpen}
          aria-expanded={open}
          aria-controls={`season-${summary.season_number}`}
          className="flex min-h-20 w-full items-center gap-4 px-5 text-left hover:bg-surface-2"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 font-bold text-accent">
            {summary.season_number === 0
              ? "★"
              : String(summary.season_number).padStart(2, "0")}
          </span>
          <span className="flex-1">
            <span className="block font-bold">{summary.name}</span>
            <span className="mt-1 block text-xs font-normal text-muted">
              {count} / {summary.episode_count}{" "}
              {tr ? "bölüm işaretlendi" : "episodes marked"}
            </span>
          </span>
          <ChevronDown
            size={20}
            className={`text-muted transition ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      {open && (
        <div
          id={`season-${summary.season_number}`}
          className="border-t border-border p-4 sm:p-5"
        >
          {loading ? (
            <p role="status" className="p-4 text-muted">
              {tr ? "Bölümler yükleniyor…" : "Loading episodes…"}
            </p>
          ) : error ? (
            <div role="alert">
              <p className="mb-3 text-danger">{error}</p>
              <Button variant="ghost" onClick={onOpen}>
                {tr ? "Yeniden dene" : "Retry"}
              </Button>
            </div>
          ) : (
            data && (
              <>
                <div className="mb-5 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={
                      busy ||
                      !tracked ||
                      !data.episodes?.some((e) => isAired(e))
                    }
                    onClick={() => onBulk(true)}
                  >
                    {tr
                      ? "Yayınlananları izlendi işaretle"
                      : "Mark aired episodes watched"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy || !tracked || !count}
                    onClick={() => onBulk(false)}
                  >
                    {tr ? "İşaretleri kaldır" : "Clear marks"}
                  </Button>
                </div>
                <div className="space-y-3">
                  {data.episodes?.map((ep) => (
                    <article
                      key={ep.id}
                      className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row ${watched(ep) ? "border-success/25 bg-success/5" : "border-border bg-bg/40"}`}
                    >
                      {ep.still_path && (
                        <div className="relative hidden aspect-video w-32 shrink-0 overflow-hidden rounded-lg md:block">
                          <Image
                            src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                            alt=""
                            fill
                            sizes="128px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold">
                          <span className="mr-2 text-accent">
                            {String(ep.episode_number).padStart(2, "0")}
                          </span>
                          {ep.name}
                        </h4>
                        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                          {ep.air_date
                            ? new Intl.DateTimeFormat(tr ? "tr-TR" : "en-US", {
                                dateStyle: "medium",
                              }).format(new Date(`${ep.air_date}T12:00:00`))
                            : tr
                              ? "Yayın tarihi belirsiz"
                              : "Air date unknown"}
                          {ep.runtime > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} />
                              {ep.runtime} {tr ? "dk" : "min"}
                            </span>
                          )}
                          {!isAired(ep) && (
                            <span className="text-warning">
                              {tr ? "Henüz yayınlanmadı" : "Not aired yet"}
                            </span>
                          )}
                        </p>
                        {ep.overview && (
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">
                            {ep.overview}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={
                          busy || !tracked || (!isAired(ep) && !watched(ep))
                        }
                        aria-pressed={watched(ep)}
                        aria-label={`${ep.name}: ${watched(ep) ? (tr ? "İzlendi işaretini kaldır" : "Mark unwatched") : tr ? "İzlendi işaretle" : "Mark watched"}`}
                        onClick={() => onToggle(ep)}
                        className="self-start"
                      >
                        {watched(ep) && <Check size={15} />}
                        {watched(ep)
                          ? tr
                            ? "İzlendi"
                            : "Watched"
                          : tr
                            ? "İzlendi işaretle"
                            : "Mark watched"}
                      </Button>
                    </article>
                  ))}
                </div>
              </>
            )
          )}
        </div>
      )}
    </section>
  );
}
