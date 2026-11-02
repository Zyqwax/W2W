import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { TvShow } from "@/lib/tv";
export default function SeriesHero({
  show,
  tr,
}: {
  show: TvShow;
  tr: boolean;
}) {
  return (
    <header className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface">
      {show.backdrop_path && (
        <Image
          src={`https://image.tmdb.org/t/p/w1280${show.backdrop_path}`}
          alt=""
          fill
          sizes="100vw"
          unoptimized
          priority
          className="-z-10 object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/60 to-transparent" />
      <div className="p-5 sm:p-8">
        <Link
          href="/tv"
          className="mb-12 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-text"
        >
          <ArrowLeft size={18} />
          {tr ? "Dizilerim" : "My series"}
        </Link>
        <div className="flex items-end gap-5 sm:gap-8">
          {show.poster_path && (
            <div className="relative hidden aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:block">
              <Image
                src={`https://image.tmdb.org/t/p/w342${show.poster_path}`}
                alt={show.name}
                fill
                sizes="160px"
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-accent">
              {tr ? "Dizi arşivi" : "Series archive"}
            </p>
            <h1 className="text-3xl font-extrabold leading-tight text-text sm:text-5xl">
              {show.name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="muted">
                {show.first_air_date?.slice(0, 4) || "—"}
              </Badge>
              <Badge tone="muted">
                {show.number_of_seasons} {tr ? "sezon" : "seasons"}
              </Badge>
              {show.vote_average > 0 && (
                <Badge tone="warning">
                  TMDB ★ {show.vote_average.toFixed(1)}
                </Badge>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {show.genres?.map((g) => (
                <span key={g.id} className="text-xs text-muted">
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
