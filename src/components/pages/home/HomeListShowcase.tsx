import Link from "next/link";
import { ArrowRight, LockKeyhole, Share2, PlayCircle } from "lucide-react";
import Image from "next/image";
import HorizontalMovieRail from "@/components/HorizontalMovieRail";

export function ShowcaseMovieCard({
  movie,
  watchedLabel,
  className,
}: {
  movie: any;
  watchedLabel?: string;
  className?: string;
}) {
  const imagePath = movie.backdropPath || movie.posterPath || movie.poster_path;
  const imageSize = movie.backdropPath ? "original" : "w780";

  return (
    <Link
      href={`/movie/${movie.id}`}
      className={`group relative block aspect-video w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-white/5 bg-surface2 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] max-md:w-[75vw] ${className || ""}`}
    >
      {imagePath ? (
        <Image
          src={`https://image.tmdb.org/t/p/${imageSize}${imagePath}`}
          alt={movie.title || "Film posteri"}
          fill
          sizes="(max-width: 768px) 75vw, 280px"
          loading="lazy"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          unoptimized
        />
      ) : (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-white/40 bg-surface1">
          {movie.title}
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Play Button Overlay (Hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <PlayCircle size={48} strokeWidth={1.5} className="text-white drop-shadow-lg" />
      </div>

      {/* Watched Badge */}
      {movie.isWatched && (
        <span className="absolute right-3 top-3 z-10 flex items-center rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-black shadow-md backdrop-blur-sm">
          {watchedLabel}
        </span>
      )}

      {/* Title & Meta */}
      <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
        <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold text-white drop-shadow-md">
          {movie.title}
        </h3>
        {/* Opsiyonel: Yıl eklenebilir if movie.release_date exists */}
        {movie.release_date && (
          <p className="mt-1 text-xs font-medium text-white/60">{movie.release_date.split("-")[0]}</p>
        )}
      </div>
    </Link>
  );
}

export default function HomeListShowcase({ t, lists, listMovies, watchedMovieIds, wishlistMovies }) {
  const watchedIds = new Set(watchedMovieIds);
  const customLists = lists.filter((list) => list.type === "custom");
  const showcaseLists = [
    { id: "wishlist", name: t("home.wishlist"), movies: wishlistMovies, visibility: "public" },
    ...customLists.map((list) => ({
      ...list,
      movies: (listMovies[list.id] || []).map((movie) => ({
        ...movie,
        isWatched: watchedIds.has(movie.id),
      })),
    })),
  ];

  if (!showcaseLists.some((list) => list.movies.length)) return null;

  return (
    <section className="mt-12 flex flex-col gap-12">
      {showcaseLists.map((list) => {
        const movies =
          list.id === "wishlist"
            ? list.movies.map((movie) => ({ ...movie, isWatched: watchedIds.has(movie.id) }))
            : list.movies;

        if (!movies.length) return null; // Boş listeleri gizle veya placeholder göster

        return (
          <article key={list.id} className="group/section min-w-0 w-full">
            <div className="mb-5 flex items-end justify-between px-1">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-2xl font-bold text-white tracking-tight max-md:text-xl">
                    {list.name}
                  </h2>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/60">
                    {list.visibility === "private" ? <LockKeyhole size={12} /> : <Share2 size={12} />}
                    {movies.length}
                  </span>
                </div>
              </div>
              <Link
                href={`/lists/${list.id}`}
                className="group flex items-center gap-1.5 text-sm font-semibold text-white/50 no-underline transition-colors hover:text-white"
              >
                Tümünü Gör
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <HorizontalMovieRail className="-mx-4 flex min-w-0 gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
              {movies.map((movie) => (
                <ShowcaseMovieCard key={movie.id} movie={movie} watchedLabel={t("profile.watched")} />
              ))}
            </HorizontalMovieRail>
          </article>
        );
      })}
    </section>
  );
}
