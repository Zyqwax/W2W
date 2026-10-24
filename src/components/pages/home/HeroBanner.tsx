"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Film, Star } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function HeroBanner({ movie, language = "tr", onShuffle, t }) {
  const isEnglish = language === "en";
  const backdrop = movie?.backdropPath || movie?.posterPath || movie?.poster_path;
  const imageSize = movie?.backdropPath ? "original" : "w780";

  if (!movie) {
    return (
      <section className="relative isolate -mx-4 flex min-h-[60vh] items-end overflow-hidden bg-bg px-5 pb-12 md:-mx-8 md:px-10 lg:min-h-[75vh]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,var(--color-accent-glow),transparent_45%)]" aria-hidden="true" />
        <div className="relative z-10 max-w-md">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-accent/15 text-accent">
            <Film size={24} aria-hidden="true" />
          </div>
          <h1 className="font-syne text-3xl font-bold text-text">{t("home.emptyWatchlist")}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{t("home.emptyText")}</p>
          <Link
            href="/search"
            className="mt-6 inline-flex min-h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-bg no-underline transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {isEnglish ? "Discover films" : "Film Keşfet"}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate -mx-4 min-h-[60vh] overflow-hidden bg-bg md:-mx-8 lg:min-h-[75vh]">
      {backdrop && (
        <Image
          src={`https://image.tmdb.org/t/p/${imageSize}${backdrop}`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          unoptimized
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-bg)_0%,transparent_60%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-bg)_0%,transparent_70%)] opacity-80" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[60vh] items-end justify-between gap-6 px-5 pb-10 pt-32 md:min-h-[75vh] md:px-10 md:pb-14">
        <div className="max-w-2xl">
          <div className="mb-4 flex flex-wrap gap-2">
            {movie.releaseDate && <Badge tone="muted">{movie.releaseDate.slice(0, 4)}</Badge>}
            {(movie.genres || []).slice(0, 2).map((genre) => <Badge key={genre} tone="accent">{genre}</Badge>)}
          </div>
          <h1 className="max-w-xl font-syne text-3xl font-bold leading-tight text-text sm:text-5xl lg:text-6xl">{movie.title}</h1>
          {movie.overview && <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-text/80 sm:text-base">{movie.overview}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/movie/${movie.id}`}
              className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-bg no-underline transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {isEnglish ? "Details" : "Detay"}
            </Link>
            <Button variant="ghost" size="md" disabled onClick={onShuffle}>
              <Check size={16} aria-hidden="true" />
              {isEnglish ? "Added to list" : "Listeye Eklendi"}
            </Button>
          </div>
        </div>

        {movie.voteAverage > 0 && (
          <div className="hidden shrink-0 items-center gap-2 self-end rounded-full bg-bg/70 px-4 py-3 text-sm font-semibold text-text backdrop-blur-md sm:flex">
            <Star size={18} className="fill-accent-alt text-accent-alt" aria-hidden="true" />
            <span>{Number(movie.voteAverage).toFixed(1)}</span>
          </div>
        )}
      </div>
    </section>
  );
}
