"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { collection, doc, onSnapshot } from "@/lib/store-client";
import { db } from "@/lib/db-client";
import { useAuth } from "@/context/AuthContext";
import { fetchAndCacheMovies } from "@/lib/tmdb";
import { getLanguageConfig, translate } from "@/lib/i18n";
import ListHeader from "@/components/pages/list-detail/ListHeader";
import ListMovieGrid from "@/components/pages/list-detail/ListMovieGrid";
import PageLoading from "@/components/ui/PageLoading";
import Skeleton from "@/components/ui/Skeleton";

export default function ListDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, language, region } = useAuth();
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);

  const [list, setList] = useState(null);
  const [rawMovies, setRawMovies] = useState([]);
  const [watchedIds, setWatchedIds] = useState([]);
  const [watchLogs, setWatchLogs] = useState({});
  const [wishlistFilter, setWishlistFilter] = useState("all");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoaded, setListLoaded] = useState(false);
  const [moviesLoaded, setMoviesLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, router, user]);

  const listId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : undefined;

  useEffect(() => {
    if (!user || !listId) return undefined;
    const listUnsubscribe = onSnapshot(
      doc(db, "users", user.uid, "lists", listId),
      (snapshot) => { setList(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as any) : null); setListLoaded(true); },
      () => { setList(null); setListLoaded(true); },
    );
    const moviesUnsubscribe = onSnapshot(
      collection(db, "users", user.uid, "lists", listId, "movies"),
      (snapshot) => { setRawMovies(snapshot.docs.map((movieDoc) => ({ id: movieDoc.id, ...movieDoc.data() }))); setMoviesLoaded(true); },
      () => { setRawMovies([]); setMoviesLoaded(true); },
    );
    const watchLogUnsubscribe = onSnapshot(collection(db, "users", user.uid, "watchLog"), (snapshot) => {
      const logs = Object.fromEntries(snapshot.docs.map((item) => [item.id, item.data()]));
      setWatchLogs(logs);
      setWatchedIds(snapshot.docs.filter((item) => item.data()?.isWatched).map((item) => item.id));
    });
    return () => {
      listUnsubscribe();
      moviesUnsubscribe();
      watchLogUnsubscribe();
    };
  }, [authLoading, listId, router, user]);

  useEffect(() => {
    let active = true;
    if (!moviesLoaded) return () => { active = false; };
    if (!rawMovies.length) {
      Promise.resolve().then(() => {
        if (!active) return;
        setMovies([]);
        setLoading(!listLoaded);
      });
      return () => { active = false; };
    }
    const { tmdb } = getLanguageConfig(language);
    fetchAndCacheMovies(rawMovies.map((movie) => movie.movieId || movie.id), tmdb, region).then((localizedById) => {
      const nextMovies = rawMovies.map((savedMovie) => {
        const movieId = String(savedMovie.movieId || savedMovie.id);
        const localizedMovie = localizedById.get(movieId);
        return localizedMovie ? { ...savedMovie, ...localizedMovie, id: movieId } : { ...savedMovie, id: movieId };
      });
      if (active) {
        setMovies(nextMovies);
        setLoading(!(listLoaded && moviesLoaded));
      }
    });
    return () => {
      active = false;
    };
  }, [language, listLoaded, moviesLoaded, rawMovies, region]);

  const displayMovies = useMemo(() => movies
    .map((movie) => ({ ...movie, ...(watchLogs[movie.id] || {}), isWatched: watchedIds.includes(movie.id) }))
    .filter((movie) => id !== "wishlist" || wishlistFilter === "all" || !movie.isWatched), [id, movies, watchLogs, watchedIds, wishlistFilter]);

  if (authLoading || !user) return <PageLoading />;
  if (loading) return <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9" aria-label={language === "tr" ? "Liste yükleniyor" : "Loading list"} aria-busy="true"><Skeleton className="mb-4" width="12rem" height="2rem" /><Skeleton className="mb-8" width="18rem" height="1rem" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">{Array.from({ length: 10 }, (_, index) => <Skeleton key={index} className="aspect-[2/3]" width="100%" height="auto" />)}</div></div>;

  if (!list) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center gap-5 px-5 text-center text-text">
        <h1 className="font-syne text-3xl font-bold">Liste bulunamadı</h1>
        <Link
          href="/lists"
          className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {t("common.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
      <ListHeader list={list} count={displayMovies.length} language={language} t={t} onEdit={() => router.push("/lists")} />
      {id === "wishlist" && <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={language === "tr" ? "Wishlist filtresi" : "Watchlist filter"}>
        {[{ value: "all", label: language === "tr" ? "Tümü" : "All" }, { value: "unwatched", label: language === "tr" ? "İzlemediklerim" : "Unwatched" }].map((option) => <button key={option.value} type="button" onClick={() => setWishlistFilter(option.value)} aria-pressed={wishlistFilter === option.value} className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${wishlistFilter === option.value ? "border-accent bg-accent text-bg" : "border-border text-muted hover:border-accent hover:text-text"}`}>{option.label}</button>)}
      </div>}
      <ListMovieGrid movies={displayMovies} language={language} watchedLabel={t("profile.watched")} t={t} isWatchedList={id === "watched"} />
    </div>
  );
}
