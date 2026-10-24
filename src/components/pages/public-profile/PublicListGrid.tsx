import Image from "next/image";
import Link from "next/link";
import { Copy, Film, ImageOff } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import HorizontalMovieRail from "@/components/HorizontalMovieRail";

function listTitle(list, ownerName, t) {
  if (list.id === "wishlist") return `${ownerName || "User"}'s Wishlist`;
  if (list.id === "watched") return `${ownerName || "User"}'s Watched`;
  return list.name || t("lists.customHelp");
}

function PublicMovieCard({ movie, ownerWatchedLabel, viewerWatchedLabel, viewerListLabel }) {
  const poster = movie?.posterPath || movie?.poster_path;
  const rating = movie?.rating || movie?.voteAverage || movie?.vote_average;

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group relative block aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-surface-2 text-text transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:w-36"
    >
      {poster ? (
        <Image
          src={`https://image.tmdb.org/t/p/w342${poster}`}
          alt={movie.title || "Movie poster"}
          fill
          sizes="(max-width: 768px) 112px, 144px"
          loading="lazy"
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted">
          <ImageOff size={24} aria-hidden="true" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent p-3 pt-10">
        <p className="truncate text-xs font-semibold text-text">{movie.title || "Film"}</p>
      </div>
      {(movie.ownerWatched || movie.viewerWatched || movie.inViewerList) && (
        <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] flex-col items-start gap-1">
          {movie.ownerWatched && <span className="rounded-full bg-accent-alt px-2 py-1 text-[10px] font-semibold text-bg">{ownerWatchedLabel}</span>}
          {movie.viewerWatched && <span className="rounded-full bg-success px-2 py-1 text-[10px] font-semibold text-bg">{viewerWatchedLabel}</span>}
          {movie.inViewerList && <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-semibold text-text">{viewerListLabel}</span>}
        </div>
      )}
      {rating > 0 && (
        <span className="absolute bottom-2 right-2 rounded-full bg-bg/80 px-2 py-1 text-[10px] font-semibold text-text">
          ★ {Number(rating).toFixed(1)}
        </span>
      )}
    </Link>
  );
}

function EmptyList({ t }) {
  return (
    <div className="flex min-h-32 items-center gap-3 border border-dashed border-border px-4 py-6 text-sm text-muted">
      <Film size={22} className="shrink-0 text-accent" aria-hidden="true" />
      {t("publicProfile.empty")}
    </div>
  );
}

function LoadingRail() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} width="8rem" height="12rem" className="shrink-0 md:h-60 md:w-40" />
      ))}
    </div>
  );
}

export default function PublicListGrid({
  targetUid,
  ownerName,
  publicLists = [],
  publicListMovies = {},
  onCopyList,
  copyingListId,
  copyStatus,
  t,
}) {
  const visibleLists = publicLists.filter((list) => list.visibility === "public");

  if (!visibleLists.length) {
    return (
      <section className="flex min-h-64 flex-col items-center justify-center border border-dashed border-border px-5 py-16 text-center">
        <Film size={28} className="mb-3 text-accent" aria-hidden="true" />
        <h2 className="font-syne text-xl font-semibold text-text">{t("publicProfile.empty")}</h2>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {visibleLists.map((list) => {
        const hasLoaded = Object.prototype.hasOwnProperty.call(publicListMovies, list.id);
        const movies = publicListMovies[list.id] || [];
        const title = listTitle(list, ownerName, t);
        const ownerWatchedLabel = `${ownerName || "Arkadaş"} izledi`;
        const isCopying = copyingListId === list.id;
        const isCopied = copyStatus?.id === list.id && copyStatus.state === "saved";

        return (
          <section key={list.id} className="border-b border-border pb-8 last:border-b-0" aria-labelledby={`public-list-${list.id}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/u/${targetUid}/lists/${list.id}`}
                className="group min-w-0 rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <h2 id={`public-list-${list.id}`} className="truncate font-syne text-xl font-bold text-text">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {hasLoaded ? `${movies.length} ${t("common.film")}` : t("common.loading")}
                </p>
              </Link>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/u/${targetUid}/lists/${list.id}`}
                  className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] px-3 text-xs font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-sm"
                >
                  Tümünü gör
                </Link>
                <button
                  type="button"
                  onClick={() => onCopyList(list)}
                  disabled={isCopying || !hasLoaded}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border px-3 text-xs font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-wait disabled:opacity-60 sm:px-4 sm:text-sm"
                >
                  <Copy size={16} aria-hidden="true" />
                  <span>{isCopying ? t("common.saving") : isCopied ? t("lists.added") : "Profilime kopyala"}</span>
                </button>
              </div>
            </div>

            {!hasLoaded ? (
              <LoadingRail />
            ) : movies.length ? (
              <HorizontalMovieRail className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:gap-4">
                {movies.map((movie) => (
                  <PublicMovieCard
                    key={movie.id}
                    movie={movie}
                    ownerWatchedLabel={ownerWatchedLabel}
                    viewerWatchedLabel="Sen izledin"
                    viewerListLabel="Senin listende"
                  />
                ))}
              </HorizontalMovieRail>
            ) : (
              <EmptyList t={t} />
            )}
            {copyStatus?.id === list.id && copyStatus.state === "error" && (
              <p className="mt-3 text-sm text-danger" role="status">{t("common.error")}</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
