import Link from "next/link";
import { Clock3 } from "lucide-react";
import MovieRow from "@/components/pages/home/MovieRow";

export default function RecentlyWatched({ movies = [], t }) {
  if (!movies.length) return null;

  return (
    <section className="py-6" aria-labelledby="recently-watched-title">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <Clock3 size={18} className="shrink-0 text-accent" aria-hidden="true" />
          <h2 id="recently-watched-title" className="truncate font-syne text-xl font-bold text-text">
            {t("profile.recentlyWatched")}
          </h2>
        </div>
        <Link
          href="/?tab=watched"
          className="inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-md)] px-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {t("profile.all")}
        </Link>
      </div>
      <MovieRow movies={movies.slice(0, 10)} watchedLabel={t("profile.watched")} />
    </section>
  );
}
