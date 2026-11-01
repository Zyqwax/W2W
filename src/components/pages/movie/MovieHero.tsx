import Image from "next/image";
import { ArrowLeft, Star } from "lucide-react";
import MovieMeta from "@/components/pages/movie/MovieMeta";

const tmdbImage = (size, path) => `https://image.tmdb.org/t/p/${size}${path}`;

export default function MovieHero({ movie, onBack, t }) {
  const hasRating = movie.voteAverage > 0;

  return (
    <section className="mx-auto max-w-[1480px] px-4 py-5 sm:px-7 lg:px-10 lg:py-8">
      <button type="button" onClick={onBack} className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <ArrowLeft size={17} aria-hidden="true" />{t("common.back")}
      </button>
      <div className="relative isolate overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
        {movie.backdropPath && <Image src={tmdbImage("original", movie.backdropPath)} alt="" fill priority sizes="(max-width: 1024px) 100vw, 1280px" className="object-cover opacity-[0.12] blur-[1px]" unoptimized />}
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-surface/70" />
        <div className="relative flex flex-col gap-6 p-5 text-text sm:flex-row sm:items-end sm:gap-8 sm:p-8 lg:p-10">
          <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl bg-white/10 shadow-xl sm:w-36 lg:w-44">
            {movie.posterPath ? <Image src={tmdbImage("w500", movie.posterPath)} alt={movie.title} fill sizes="(max-width: 640px) 112px, 176px" className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted">W2W</div>}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <MovieMeta movie={movie} t={t} />
            <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl lg:text-5xl">{movie.title}</h1>
            {movie.tagline && <p className="mt-2 text-sm italic text-muted">{movie.tagline}</p>}
            {movie.overview && <p className="mt-4 line-clamp-3 max-w-3xl text-sm leading-6 text-muted">{movie.overview}</p>}
            {hasRating && <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-2 text-sm font-bold text-text"><Star size={15} className="fill-amber-500 text-amber-500" />{Number(movie.voteAverage).toFixed(1)}<span className="text-xs font-semibold text-muted">TMDB</span></span>}
          </div>
        </div>
      </div>
    </section>
  );
}
