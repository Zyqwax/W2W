import Link from "next/link";
import { Clock3, Compass } from "lucide-react";
import MovieRow from "@/components/pages/home/MovieRow";

export default function RecentlyWatched({ movies = [], t }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6" aria-labelledby="recently-watched-title">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <Clock3 size={18} className="shrink-0 text-accent" aria-hidden="true" />
          <h2 id="recently-watched-title" className="truncate font-syne text-xl font-bold text-text">
            {t("profile.recentlyWatched")}
          </h2>
        </div>
        <Link
          href="/lists/watched"
          className="inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-md)] px-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {t("profile.all")}
        </Link>
      </div>
      {movies.length ? <MovieRow movies={movies} watchedLabel={t("profile.watched")} /> : (
        <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/60 px-5 py-6 text-center">
          <p className="text-sm text-muted">{t("profile.emptyWatched")}</p>
          <Link href="/search" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-[#111113] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <Compass size={16} aria-hidden="true" />{t("profile.discover")}
          </Link>
        </div>
      )}
    </section>
  );
}
