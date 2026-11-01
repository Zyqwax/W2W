import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock3, Star } from "lucide-react";
import MovieMeta from "@/components/pages/movie/MovieMeta";

const tmdbImage = (size, path) => `https://image.tmdb.org/t/p/${size}${path}`;

export default function MovieHero({ movie, onBack, userStatus, t }) {
  const hasRating = Number(movie.voteAverage) > 0;
  const year = movie.releaseDate?.slice(0, 4);

  return (
    <section className="mx-auto max-w-[1480px] px-4 pt-4 sm:px-7 lg:px-10 lg:pt-7">
      <button type="button" onClick={onBack} className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <ArrowLeft size={17} aria-hidden="true" />{t("common.back")}
      </button>
      <div className="relative isolate min-h-[390px] overflow-hidden rounded-[28px] border border-border bg-surface shadow-xl sm:min-h-[430px] lg:min-h-[470px]">
        {movie.backdropPath && <Image src={tmdbImage("original", movie.backdropPath)} alt="" fill priority sizes="(max-width: 1024px) 100vw, 1440px" className="object-cover object-center" unoptimized />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,.98)_0%,rgba(9,9,11,.86)_42%,rgba(9,9,11,.45)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,9,11,.92)_0%,transparent_45%,rgba(9,9,11,.18)_100%)]" />
        <div className="relative flex min-h-[390px] flex-col justify-end gap-5 p-5 text-text sm:min-h-[430px] sm:flex-row sm:items-end sm:gap-8 sm:p-8 lg:min-h-[470px] lg:gap-10 lg:p-10">
          <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-surface-2 shadow-2xl sm:w-36 lg:w-52">
            {movie.posterPath ? <Image src={tmdbImage("w500", movie.posterPath)} alt={`${movie.title} poster`} fill sizes="(max-width: 640px) 112px, 208px" className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted">W2W</div>}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            {userStatus && <span className={`mb-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${userStatus === "watched" ? "border-success/40 bg-success/10 text-success" : "border-accent/40 bg-accent/10 text-accent"}`}>
              {userStatus === "watched" ? t("profile.watched") : t("movie.inWishlist")}
            </span>}
            <h1 className="max-w-4xl text-3xl font-extrabold leading-[1.05] tracking-tight text-text sm:text-4xl lg:text-6xl">{movie.title}</h1>
            {movie.originalTitle && movie.originalTitle !== movie.title && <p className="mt-2 text-sm text-muted">{movie.originalTitle}</p>}
            {movie.tagline && <p className="mt-3 max-w-2xl text-sm italic leading-6 text-text/80 sm:text-base">“{movie.tagline}”</p>}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text/80">
              {year && <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} aria-hidden="true" />{year}</span>}
              {movie.runtime > 0 && <span className="inline-flex items-center gap-1.5"><Clock3 size={15} aria-hidden="true" />{movie.runtime} {t("movie.runtime")}</span>}
              {hasRating && <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 font-bold text-text"><Star size={15} className="fill-amber-500 text-amber-500" aria-hidden="true" />{Number(movie.voteAverage).toFixed(1)}<span className="text-xs font-medium text-muted">TMDB</span></span>}
            </div>
            {!!movie.genres?.length && <div className="mt-4 max-w-3xl"><MovieMeta movie={{ genres: movie.genres }} t={t} /></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
