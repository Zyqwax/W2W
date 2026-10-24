"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Heart, ImageOff, Trash2 } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

export default function MovieCard({ movie, loading = false, watchedLabel = "Watched" }) {
  if (loading) {
    return <Skeleton width="8rem" height="12rem" rounded="md" className="shrink-0 md:h-60 md:w-40" />;
  }

  const poster = movie?.posterPath || movie?.poster_path;
  const rating = movie?.rating || movie?.voteAverage || movie?.vote_average;

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group relative block aspect-[2/3] w-32 shrink-0 snap-start overflow-hidden rounded-[var(--radius-md)] bg-surface-2 text-text no-underline transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:w-40"
    >
      {poster ? (
        <Image
          src={`https://image.tmdb.org/t/p/w342${poster}`}
          alt={movie.title || "Movie poster"}
          fill
          sizes="(max-width: 768px) 128px, 160px"
          loading="lazy"
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted">
          <ImageOff size={24} aria-hidden="true" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-surface-2/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-2 bg-gradient-to-t from-bg/95 to-transparent p-3 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="min-w-0 truncate text-xs font-semibold text-text">{movie.title}</span>
        <span className="flex shrink-0 items-center gap-1 text-muted" aria-hidden="true">
          <Heart size={15} />
          <Trash2 size={15} />
        </span>
      </div>
      {movie.isWatched && (
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-success px-2 py-1 text-[10px] font-semibold text-bg">
          <Check size={12} aria-hidden="true" />
          <span className="sr-only">{watchedLabel}</span>
        </span>
      )}
      {rating > 0 && <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-text">★ {Number(rating).toFixed(1)}</span>}
    </Link>
  );
}
