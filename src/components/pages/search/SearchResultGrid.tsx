import Image from "next/image";
import Link from "next/link";
import { Check, Film, Plus, SearchX, Star } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

function ResultSkeleton() {
  return <div className="space-y-3"><div className="relative aspect-[2/3] overflow-hidden rounded-2xl"><Skeleton width="100%" height="100%" className="absolute inset-0" /></div><Skeleton width="72%" height="0.9rem" rounded="sm" /><Skeleton width="40%" height="0.7rem" rounded="sm" /></div>;
}

export default function SearchResultGrid({ movies = [], localMovies = [], loading, isDebouncing, queryInput, resultsCount, resultsLabel, noResultsLabel, tryDifferentLabel, watchedLabel, wishlistLabel, language = "tr", savingId, savedId, onAdd }) {
  const isLoading = loading || isDebouncing;
  const isEnglish = language === "en";

  if (isLoading) return <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 10 }, (_, index) => <ResultSkeleton key={index} />)}</div>;

  if (!movies.length && queryInput.trim()) return <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl bg-surface px-6 text-center text-muted"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-accent"><SearchX size={25} /></div><p className="font-semibold text-text">{noResultsLabel}</p><p className="mt-1 text-sm">{tryDifferentLabel}</p></div>;

  return (
    <section aria-live="polite" aria-busy={isLoading} className="pb-8">
      {movies.length > 0 && !["genre", "year"].includes(queryInput.trim()) && <p className="mb-4 text-sm text-muted"><strong className="text-text">{resultsCount ?? movies.length}</strong> {resultsLabel}</p>}
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {movies.map((movie) => {
          const localData = localMovies?.find((item) => String(item.id) === String(movie.id));
          const title = movie.title || movie.original_title || "Film";
          const year = movie.release_date?.slice(0, 4) || "";
          const isSaved = Boolean(localData?.status === "wishlist" || localData?.status === "watched" || savedId === String(movie.id));
          const poster = movie.poster_path || localData?.posterPath;
          return (
            <article key={movie.id} className="group min-w-0">
              <div className="relative overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-black/5">
                <Link href={`/movie/${movie.id}`} aria-label={`${title}${year ? `, ${year}` : ""}`} className="relative block aspect-[2/3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">
                  {poster ? <Image src={`https://image.tmdb.org/t/p/w342${poster}`} alt={title} fill sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 210px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" unoptimized /> : <span className="grid h-full place-items-center text-muted"><Film size={26} /></span>}
                  {movie.vote_average > 0 && <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-text"><Star size={12} className="fill-amber-500 text-amber-500" />{Number(movie.vote_average).toFixed(1)}</span>}
                  {localData?.isWatched && <span className="absolute left-2 top-2 rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-white">{watchedLabel}</span>}
                </Link>
                <button type="button" onClick={() => !isSaved && onAdd?.(movie)} disabled={isSaved || savingId === String(movie.id)} aria-label={isSaved ? (isEnglish ? "Saved to your list" : "Listene eklendi") : (isEnglish ? `Add ${title} to watchlist` : `${title} filmini izleme listeme ekle`)} aria-pressed={isSaved} className={`absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-default ${isSaved ? "bg-white text-success" : "bg-white text-text hover:bg-accent hover:text-white"}`}>
                  {savingId === String(movie.id) ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : isSaved ? <Check size={18} /> : <Plus size={19} />}
                </button>
              </div>
              <Link href={`/movie/${movie.id}`} className="mt-3 block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <h3 className="truncate text-sm font-bold text-text group-hover:text-accent">{title}</h3>
                <p className="mt-1 text-xs text-muted">{year || (isEnglish ? "Release year unknown" : "Yıl bilgisi yok")}</p>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
