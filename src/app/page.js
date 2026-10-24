"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { translate } from "@/lib/i18n";
import HeroBanner from "@/components/pages/home/HeroBanner";
import MovieRow from "@/components/pages/home/MovieRow";
import SectionHeader from "@/components/pages/home/SectionHeader";
import PageLoading from "@/components/ui/PageLoading";

dayjs.extend(relativeTime);

const SORT_VALUES = {
  wishlist: ["addedAt_desc", "addedAt_asc", "title_asc", "title_desc"],
};

function sortMovies(movies, sortKey, locale) {
  const [field, dir] = sortKey.split("_");
  return [...movies].sort((a, b) => {
    if (field === "title") {
      return dir === "asc"
        ? (a.title || "").localeCompare(b.title || "", locale)
        : (b.title || "").localeCompare(a.title || "", locale);
    }
    const av = a[field] || 0;
    const bv = b[field] || 0;
    return dir === "asc" ? av - bv : bv - av;
  });
}

export default function Home() {
  const { user, loading, language } = useAuth();
  const t = (key, values) => translate(language, key, values);
  const { movies, lists, listMovies, watchedMovieIds } = useAppData();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("seyir_homeTab") || sessionStorage.getItem("movieTracker_homeTab") || "wishlist"
      : "wishlist",
  );

  const [sortKey, setSortKey] = useState(() => {
    if (typeof window === "undefined") return "addedAt_desc";
    const saved = sessionStorage.getItem("seyir_homeSortKey") || sessionStorage.getItem("movieTracker_homeSortKey");
    return SORT_VALUES.wishlist.includes(saved) ? saved : "addedAt_desc";
  });

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const [heroMovieId, setHeroMovieId] = useState(null);

  // Wishlist ve Watched türetilen verileri
  const wishlist = useMemo(() => movies?.filter((m) => m.status === "wishlist") || [], [movies]);
  const watched = useMemo(() => movies?.filter((m) => m.isWatched) || [], [movies]);

  useEffect(() => {
    if (!loading && user === null) router.push("/login");
  }, [user, loading, router]);

  // Dropdown dışı tıklama kontrolü
  useEffect(() => {
    const close = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (loading) return <PageLoading />;
  if (!user) return null;

  const hero = wishlist.find((m) => m.id === heroMovieId) || wishlist[0];
  const listed = sortMovies(wishlist, sortKey, language);

  const sortLabels = {
    addedAt_desc: t("home.sortAddedDesc"),
    addedAt_asc: t("home.sortAddedAsc"),
    watchedAt_desc: t("home.sortWatchedDesc"),
    watchedAt_asc: t("home.sortWatchedAsc"),
    rating_desc: t("home.sortRatingDesc"),
    rating_asc: t("home.sortRatingAsc"),
    title_asc: t("home.sortTitleAsc"),
    title_desc: t("home.sortTitleDesc"),
  };

  const options = SORT_VALUES.wishlist.map((value) => ({
    value,
    label: sortLabels[value] || value,
  }));

  const changeTab = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem("seyir_homeTab", tab);
  };

  const shuffle = () => {
    if (wishlist.length) {
      const nextList = wishlist.filter((m) => m.id !== heroMovieId);
      const target = nextList.length ? nextList : wishlist;
      setHeroMovieId(target[Math.floor(Math.random() * target.length)].id);
    }
  };

  const changeSort = (value) => {
    setSortKey(value);
    sessionStorage.setItem("seyir_homeSortKey", value);
    setSortOpen(false);
  };

  const viewAllLabel = language === "en" ? "View all" : "Tümünü Gör";
  const emptyLabel = language === "en" ? "No films yet." : "Henüz film yok.";
  const sortButtonLabel = options.find((option) => option.value === sortKey)?.label || (language === "en" ? "Sort" : "Sırala");

  return (
    <div className="mx-auto max-w-7xl overflow-hidden bg-bg pb-24 font-inter text-text lg:pb-12">
      <HeroBanner movie={hero} language={language} onShuffle={shuffle} t={t} />
      <div className="space-y-10 px-4 py-8 md:px-8 md:py-10">
        <section aria-labelledby="wishlist-heading">
          <SectionHeader
            title={t("home.wishlist")}
            count={listed.length}
            href="/lists/wishlist"
            viewAllLabel={viewAllLabel}
            extra={
              <div className="relative" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setSortOpen((open) => !open)}
                  aria-label={sortButtonLabel}
                  aria-expanded={sortOpen}
                  className="min-h-11 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-xs font-semibold text-muted transition-colors hover:border-accent hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {sortButtonLabel}
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-12 z-20 min-w-48 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-2 p-1 shadow-xl shadow-black/30">
                    {options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => changeSort(option.value)}
                        className={`flex min-h-11 w-full items-center rounded-[var(--radius-sm)] px-3 text-left text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${option.value === sortKey ? "bg-accent/15 text-accent" : "text-muted hover:bg-accent/10 hover:text-text"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            }
          />
          <h2 id="wishlist-heading" className="sr-only">{t("home.wishlist")}</h2>
          {listed.length ? <MovieRow movies={listed} watchedLabel={t("profile.watched")} emptyLabel={emptyLabel} /> : <p className="py-5 text-sm text-muted">{emptyLabel}</p>}
        </section>

        <section aria-labelledby="watched-heading">
          <SectionHeader title={t("home.watched")} count={watched.length} href="/lists/watched" viewAllLabel={viewAllLabel} />
          <h2 id="watched-heading" className="sr-only">{t("home.watched")}</h2>
          <MovieRow movies={watched} watchedLabel={t("profile.watched")} emptyLabel={emptyLabel} />
        </section>

        {lists.filter((list) => list.type === "custom").map((list) => {
          const movies = listMovies[list.id] || [];
          const displayMovies = movies.map((movie) => ({ ...movie, isWatched: movie.isWatched || watchedMovieIds.includes(movie.id) }));
          return (
            <section key={list.id} aria-labelledby={`list-${list.id}-heading`}>
              <SectionHeader title={list.name} count={displayMovies.length} href={`/lists/${list.id}`} viewAllLabel={viewAllLabel} />
              <h2 id={`list-${list.id}-heading`} className="sr-only">{list.name}</h2>
              {displayMovies.length ? <MovieRow movies={displayMovies} watchedLabel={t("profile.watched")} emptyLabel={emptyLabel} /> : <p className="py-5 text-sm text-muted">{emptyLabel}</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
