import { CalendarDays, Clock3, Star } from "lucide-react";
import Badge from "@/components/ui/Badge";

export default function MovieMeta({ movie, t }) {
  const year = movie?.releaseDate?.split("-")[0];
  const genres = movie?.genres || [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        {year && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={15} aria-hidden="true" />
            {year}
          </span>
        )}
        {movie?.runtime > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={15} aria-hidden="true" />
            {movie.runtime} {t("movie.runtime")}
          </span>
        )}
        {movie?.voteAverage > 0 && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-accent-alt">
            <Star size={15} fill="currentColor" aria-hidden="true" />
            {movie.voteAverage}/10
          </span>
        )}
      </div>
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => <Badge key={genre} tone="muted">{genre}</Badge>)}
        </div>
      )}
    </div>
  );
}
