import Image from "next/image";
import { ArrowLeft, BadgeCheck, Star } from "lucide-react";
import MovieMeta from "@/components/pages/movie/MovieMeta";

const tmdbImage = (size, path) => `https://image.tmdb.org/t/p/${size}${path}`;

export default function MovieHero({ movie, onBack, t }) {
  const hasRating = movie.voteAverage > 0;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-bg">
        {movie.backdropPath ? (
          <Image
            src={tmdbImage("original", movie.backdropPath)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-110 object-cover opacity-20 blur-[2px]"
            unoptimized
          />
        ) : <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,var(--color-surface-2),var(--color-bg)_62%)]" />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-bg)_0%,rgb(10_10_15_/_65%)_45%,var(--color-bg)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-bg)_0%,transparent_38%,var(--color-bg)_92%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-5 md:px-8 md:pb-16 md:pt-8">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("common.back")}
          className="mb-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface/75 text-text shadow-lg shadow-bg/30 backdrop-blur-md transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:mb-14"
        >
          <ArrowLeft size={19} aria-hidden="true" />
        </button>

        <div className="grid gap-6 md:grid-cols-[144px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[184px_minmax(0,1fr)_176px] lg:items-end lg:gap-10">
          <div className="relative aspect-[2/3] w-32 overflow-hidden rounded-[var(--radius-md)] border border-white/20 bg-surface-2 shadow-2xl shadow-bg md:w-36 lg:w-44">
            {movie.posterPath ? (
              <Image
                src={tmdbImage("w500", movie.posterPath)}
                alt={movie.title}
                fill
                sizes="(min-width: 1024px) 176px, (min-width: 768px) 144px, 128px"
                className="object-cover"
                unoptimized
              />
            ) : <div className="h-full w-full bg-[linear-gradient(145deg,var(--color-accent),var(--color-surface-2)_55%,var(--color-bg))]" />}
          </div>

          <div className="min-w-0 space-y-5 md:pb-1">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-accent">
                <BadgeCheck size={15} aria-hidden="true" />
                <span>{t("common.film")}</span>
              </div>
              <h1 className="max-w-4xl font-syne text-4xl font-bold leading-[1.04] text-text md:text-5xl lg:text-6xl">{movie.title}</h1>
            </div>
            <MovieMeta movie={movie} t={t} />
            {movie.tagline && <p className="max-w-2xl text-sm italic leading-6 text-muted">{movie.tagline}</p>}
            <p className="max-w-3xl text-sm leading-7 text-muted md:line-clamp-3">{movie.overview || t("movie.missingOverview")}</p>
          </div>

          <div className="flex items-center gap-4 border-t border-border pt-4 md:col-span-2 lg:col-span-1 lg:block lg:border-l lg:border-t-0 lg:pb-1 lg:pl-6 lg:pt-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent lg:mb-4 lg:h-20 lg:w-20">
              <Star size={26} fill="currentColor" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted">TMDB</p>
              <p className="font-syne text-3xl font-bold text-text">{hasRating ? movie.voteAverage : "—"}<span className="ml-1 text-sm font-normal text-muted">/10</span></p>
              <p className="text-xs text-muted">{t("movie.rating")}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-px max-w-7xl bg-border" />
    </section>
  );
}
