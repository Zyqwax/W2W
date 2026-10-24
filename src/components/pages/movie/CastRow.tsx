import Image from "next/image";
import HorizontalMovieRail from "@/components/HorizontalMovieRail";

const tmdbImage = (path) => `https://image.tmdb.org/t/p/w342${path}`;

export default function CastRow({ cast, t }) {
  const actors = (cast || []).slice(0, 5);
  if (!actors.length) return null;

  return (
    <section className="space-y-4" aria-labelledby="movie-cast-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="movie-cast-heading" className="font-syne text-xl font-semibold text-text md:text-2xl">{t("movie.cast")}</h2>
        <span className="text-xs text-muted">{actors.length}</span>
      </div>
      <HorizontalMovieRail className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide md:-mx-0 md:gap-3 md:px-0">
        {actors.map((actor) => (
          <article key={`${actor.name}-${actor.character}`} className="relative aspect-[3/4] w-32 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-border bg-surface-2 md:w-36">
            {actor.profilePath ? (
              <Image src={tmdbImage(actor.profilePath)} alt={actor.name} fill sizes="(min-width: 768px) 144px, 128px" className="object-cover" unoptimized />
            ) : <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,var(--color-accent),var(--color-surface-2))] text-4xl font-semibold text-bg">{actor.name?.charAt(0)}</div>}
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgb(10_10_15_/_95%),transparent)] px-3 pb-3 pt-12">
              <p className="truncate text-sm font-semibold text-text">{actor.name}</p>
              <p className="truncate text-[11px] text-muted">{actor.character}</p>
            </div>
          </article>
        ))}
      </HorizontalMovieRail>
    </section>
  );
}
