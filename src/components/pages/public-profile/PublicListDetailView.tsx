import Link from "next/link";
import { ArrowLeft, Globe2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ListMovieGrid from "@/components/pages/list-detail/ListMovieGrid";

function listTitle(list, ownerName, t) {
  if (list.id === "wishlist") return `${ownerName || "User"}'s Wishlist`;
  if (list.id === "watched") return `${ownerName || "User"}'s Watched`;
  return list.name || t("lists.customHelp");
}

export default function PublicListDetailView({ targetUid, ownerName, list, movies, language, t }) {
  const title = listTitle(list, ownerName, t);

  return (
    <main className="mx-auto min-h-full max-w-7xl px-4 pb-24 pt-8 text-text md:px-8 md:pt-12">
      <Link
        href={`/u/${targetUid}`}
        className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        {t("common.back")}
      </Link>

      <header className="mb-8 border-b border-border pb-6">
        <p className="mb-2 text-sm font-medium text-accent">{t("lists.public")}</p>
        <h1 className="font-syne text-3xl font-bold text-text md:text-4xl">{title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>{movies.length} {t("common.film")}</span>
          <Badge tone="accent"><Globe2 size={14} aria-hidden="true" />{t("lists.public")}</Badge>
        </div>
      </header>

      <ListMovieGrid
        movies={movies}
        language={language}
        ownerWatchedLabel={`${ownerName || "Arkadaş"} izledi`}
        viewerWatchedLabel="Sen izledin"
        viewerListLabel="Senin listende"
        watchedLabel={t("profile.watched")}
        t={t}
        isWatchedList={list.id === "watched"}
      />
    </main>
  );
}
