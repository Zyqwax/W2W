import Image from "next/image";
import Link from "next/link";
import { Check, Film, Search, X } from "lucide-react";

const posterPath = (movie) => movie?.posterPath || movie?.poster_path;

function dateValue(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value === "number") return new Date(value);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthLabel(value, language) {
  const date = dateValue(value);
  if (!date) return language === "tr" ? "Tarih belirtilmemiş" : "Date not available";
  return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function watchedDate(value, language) {
  const date = dateValue(value);
  if (!date) return language === "tr" ? "Tarih belirtilmemiş" : "Date not available";
  return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export interface ListMovieGridProps {
  movies?: any[];
  language?: string;
  watchedLabel?: string;
  ownerWatchedLabel?: string;
  viewerWatchedLabel?: string;
  viewerListLabel?: string;
  t: (key: string, values?: Record<string, any>) => string;
  onRemove?: (movieId: any) => void;
  isWatchedList?: boolean;
}

export default function ListMovieGrid({
  movies = [],
  language,
  watchedLabel,
  ownerWatchedLabel,
  viewerWatchedLabel,
  viewerListLabel,
  t,
  onRemove,
  isWatchedList = false,
}: ListMovieGridProps) {
  if (!movies.length) {
    return (
      <section
        className="flex min-h-[360px] flex-col items-center justify-center border-t border-border px-5 py-16 text-center"
        aria-label={t("home.emptyTitle")}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border text-muted">
          <Film size={28} aria-hidden="true" />
        </div>
        <h2 className="font-syne text-xl font-semibold text-text">
          {language === "tr" ? "Henüz film eklenmemiş" : "No films added yet"}
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{t("home.emptyText")}</p>
        <Link
          href="/search"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-bg transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Search size={16} aria-hidden="true" />
          {t("search.title")}
        </Link>
      </section>
    );
  }

  const shouldGroupByMonth = isWatchedList;
  const groups: Record<string, { label: string | null; movies: any[] }> = shouldGroupByMonth
    ? movies.reduce<Record<string, { label: string | null; movies: any[] }>>((result, movie) => {
        const date = dateValue(movie.watchedAt || movie.watchDate);
        const key = date ? `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}` : "undated";
        result[key] ||= { label: monthLabel(movie.watchedAt || movie.watchDate, language), movies: [] };
        result[key].movies.push(movie);
        return result;
      }, {})
    : { all: { label: null, movies } };

  const orderedGroups = Object.entries(groups)
    .sort(([a], [b]) => (a === "undated" ? 1 : b === "undated" ? -1 : b.localeCompare(a)))
    .map(([, group]) => ({
      ...group,
      movies: shouldGroupByMonth
        ? [...group.movies].sort(
            (a, b) =>
              (dateValue(b.watchedAt || b.watchDate)?.getTime() || 0) -
              (dateValue(a.watchedAt || a.watchDate)?.getTime() || 0),
          )
        : group.movies,
    }));

  return (
    <section aria-label={t("lists.title")} className="space-y-8">
      {orderedGroups.map((group) => (
        <div key={group.label || "all"}>
          {group.label && (
            <h2 className="mb-4 border-b border-border pb-2 text-sm font-semibold capitalize text-muted">
              {group.label}
            </h2>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
            {group.movies.map((movie) => {
              const path = posterPath(movie);
              const title = movie.title || "Film";
              const releaseYear = movie.releaseDate ? movie.releaseDate.slice(0, 4) : movie.release_date ? movie.release_date.slice(0, 4) : null;
              const rating = movie.rating || movie.voteAverage || movie.vote_average;

              return (
                <div key={movie.id} className="group relative flex flex-col min-w-0">
                  <Link
                    href={`/movie/${movie.id}`}
                    className="relative block aspect-[2/3] w-full overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-2 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${path}`}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 180px"
                        loading="lazy"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <Film size={28} aria-hidden="true" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/95 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                    {/* Status badges */}
                    <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 items-start">
                      {movie.isWatched && !movie.ownerWatched && !movie.viewerWatched && !movie.inViewerList && (
                        <span className="flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[10px] font-semibold text-bg shadow-md">
                          <Check size={11} aria-hidden="true" />
                          <span>{watchedLabel}</span>
                        </span>
                      )}
                      {movie.ownerWatched && ownerWatchedLabel && (
                        <span className="rounded-full bg-accent-alt px-2 py-0.5 text-[10px] font-semibold text-bg shadow-md">
                          {ownerWatchedLabel}
                        </span>
                      )}
                      {movie.viewerWatched && viewerWatchedLabel && (
                        <span className="flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[10px] font-semibold text-bg shadow-md">
                          <Check size={11} aria-hidden="true" />
                          <span>{viewerWatchedLabel}</span>
                        </span>
                      )}
                      {movie.inViewerList && viewerListLabel && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-bg shadow-md">
                          {viewerListLabel}
                        </span>
                      )}
                    </div>

                    {/* Rating badge */}
                    {rating > 0 && (
                      <span className="absolute bottom-2 right-2 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        ★ {Number(rating).toFixed(1)}
                      </span>
                    )}

                    {/* Watched date for watched list */}
                    {isWatchedList && (movie.watchedAt || movie.watchDate) && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                        {watchedDate(movie.watchedAt || movie.watchDate, language)}
                      </span>
                    )}
                  </Link>

                  {/* Remove button */}
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(movie)}
                      aria-label={t("movie.removeRecord")}
                      className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-bg/80 text-muted opacity-0 shadow-md backdrop-blur-xs transition-all hover:bg-danger hover:text-bg group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}

                  {/* Movie Info */}
                  <div className="mt-2 min-w-0">
                    <Link
                      href={`/movie/${movie.id}`}
                      className="block truncate text-sm font-semibold text-text hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {title}
                    </Link>
                    {releaseYear && (
                      <p className="mt-0.5 text-xs text-muted">{releaseYear}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
