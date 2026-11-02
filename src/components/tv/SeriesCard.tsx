import Image from "next/image";
import Link from "next/link";
import { ImageOff, Tv } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { statusLabel, type TvShow } from "@/lib/tv";
export default function SeriesCard({
  show,
  status,
  watchedCount,
  tr = true,
}: {
  show: TvShow;
  status?: string;
  watchedCount?: number;
  tr?: boolean;
}) {
  const poster = show.poster_path || show.posterPath;
  return (
    <Link
      href={`/tv/${show.id}`}
      className="group block min-w-0 rounded-2xl focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:border-accent/60">
        {poster ? (
          <Image
            src={`https://image.tmdb.org/t/p/w342${poster}`}
            alt={show.name}
            fill
            sizes="(max-width: 640px) 45vw, 200px"
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted">
            <ImageOff size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-black/20" />
        <span className="absolute left-3 top-3">
          <Badge tone="muted">
            <Tv size={12} className="mr-1" />
            {tr ? "Dizi" : "Series"}
          </Badge>
        </span>
        <div className="absolute inset-x-3 bottom-3">
          {status && (
            <Badge tone={status === "completed" ? "success" : "accent"}>
              {statusLabel(status, tr)}
            </Badge>
          )}
          {show.vote_average > 0 && (
            <span className="float-right rounded-full bg-black/70 px-2 py-1 text-xs text-warning">
              ★ {show.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <h3 className="mt-3 truncate text-sm font-bold text-text group-hover:text-accent">
        {show.name}
      </h3>
      <p className="mt-1 text-xs text-muted">
        {watchedCount !== undefined
          ? `${watchedCount} ${tr ? "bölüm izlendi" : "episodes watched"}`
          : show.first_air_date?.slice(0, 4) || (tr ? "Dizi" : "Series")}
      </p>
    </Link>
  );
}
