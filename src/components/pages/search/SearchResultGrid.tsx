import Image from "next/image";
import Link from "next/link";
import { Check, Plus, SearchX } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

function ResultSkeleton() {
  return <div className="space-y-3"><div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-md)]"><Skeleton width="100%" height="100%" className="absolute inset-0" /></div><Skeleton width="72%" height="0.9rem" rounded="sm" /><Skeleton width="40%" height="0.7rem" rounded="sm" /></div>;
}

export default function SearchResultGrid({ movies, localMovies = [], loading, isDebouncing, queryInput, resultsCount, resultsLabel, noResultsLabel, tryDifferentLabel, watchedLabel, wishlistLabel }) {
  const isLoading = loading || isDebouncing;

  return (
    <section className="px-4 py-6 md:px-0 md:py-8" aria-live="polite">
      {isLoading ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => <ResultSkeleton key={index} />)}
        </div>
      ) : movies.length > 0 ? (
        <>
          <p className="mb-5 text-sm text-muted"><span className="font-semibold text-text">{resultsCount}</span> {resultsLabel}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => {
              const localData = localMovies.find((item) => String(item.id) === String(movie.id));
              const title = movie.title || movie.original_title || "Movie";
              const year = movie.release_date?.slice(0, 4) || "—";
              return (
                <Link key={movie.id} href={`/movie/${movie.id}`} className="group min-w-0 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-2">
                    {movie.poster_path ? <Image src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} alt={title} fill sizes="(max-width: 640px) 44vw, (max-width: 1024px) 22vw, 180px" className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized /> : <div className="flex h-full items-center justify-center text-muted"><SearchX size={24} aria-hidden="true" /></div>}
                    <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-bg/75 text-text backdrop-blur-sm" aria-label={wishlistLabel}><Plus size={16} aria-hidden="true" /></span>
                    {localData?.isWatched && <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-success text-bg" title={watchedLabel}><Check size={14} aria-hidden="true" /></span>}
                  </div>
                  <h3 className="mt-3 truncate text-sm font-semibold text-text">{title}</h3>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted"><span>{year}</span>{movie.vote_average > 0 && <span>{Number(movie.vote_average).toFixed(1)}/10</span>}</p>
                </Link>
              );
            })}
          </div>
        </>
      ) : queryInput.trim() ? (
        <div className="flex min-h-72 flex-col items-center justify-center text-center text-muted">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border text-accent"><SearchX size={30} aria-hidden="true" /></div>
          <p className="text-sm font-semibold text-text">{noResultsLabel}</p>
          <p className="mt-1 text-xs text-muted">{tryDifferentLabel}</p>
        </div>
      ) : null}
    </section>
  );
}
