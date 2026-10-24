import { Play } from "lucide-react";

export default function TrailerButton({ trailer, t }) {
  if (!trailer) return null;

  return (
    <section className="space-y-4" aria-labelledby="movie-trailer-heading">
      <h2 id="movie-trailer-heading" className="font-syne text-xl font-semibold text-text">{t("movie.trailer")}</h2>
      <a
        href={`https://www.youtube.com/watch?v=${encodeURIComponent(trailer)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] border border-accent/50 bg-accent/10 px-5 text-sm font-semibold text-accent transition hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-bg">
          <Play size={15} fill="currentColor" aria-hidden="true" />
        </span>
        {t("movie.trailer")}
      </a>
    </section>
  );
}
