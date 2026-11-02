"use client";
import SeriesCard from "@/components/tv/SeriesCard";
import { type TvLibraryItem } from "@/lib/tv";

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
  const t = (key: string, values?: Record<string, any>) =>
    translate(language, key, values);

  const [list, setList] = useState(null);
  const [rawMovies, setRawMovies] = useState([]);
  const [watchedIds, setWatchedIds] = useState([]);
  const [watchLogs, setWatchLogs] = useState({});
  const [wishlistFilter, setWishlistFilter] = useState("all");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoaded, setListLoaded] = useState(false);
  const [moviesLoaded, setMoviesLoaded] = useState(false);
  const [tvItems, setTvItems] = useState<TvLibraryItem[]>([]);
  const [tvLoading, setTvLoading] = useState(true);
  const [tvError, setTvError] = useState(false);
  const [tvRetry, setTvRetry] = useState(0);
  const [mediaTab, setMediaTab] = useState(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("type") === "tv"
      ? "tv"
      : "movie",
  );

  useEffect(() => {
    if (!user || typeof id !== "string") return;
    let active = true;
    // Reset the remote resource when the list identity changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTvLoading(true);
    setTvError(false);
    setTvItems([]);
    fetch(
      id === "wishlist" || id === "watched"
        ? "/api/tv?action=library"
        : `/api/tv?action=list&listId=${encodeURIComponent(id)}`,
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((rows) => {
        if (active)
          setTvItems(
            id === "wishlist"
              ? rows.filter((row) => row.state.status === "watchlist")
              : id === "watched"
                ? rows.filter((row) => row.state.status === "completed")
                : rows,
          );
      })
      .catch(() => {
        if (active) setTvError(true);
      })
      .finally(() => {
        if (active) setTvLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, id, tvRetry]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, router, user]);

  const listId =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : undefined;

  useEffect(() => {
    if (!user || !listId) return undefined;
    const listUnsubscribe = onSnapshot(
      doc(db, "users", user.uid, "lists", listId),
      (snapshot) => {
        setList(
          snapshot.exists()
            ? ({ id: snapshot.id, ...snapshot.data() } as any)
            : null,
        );
        setListLoaded(true);
      },
      () => {
        setList(null);
        setListLoaded(true);
      },
    );
    const moviesUnsubscribe = onSnapshot(
      collection(db, "users", user.uid, "lists", listId, "movies"),
      (snapshot) => {
        setRawMovies(
          snapshot.docs.map((movieDoc) => ({
            id: movieDoc.id,
            ...movieDoc.data(),
          })),
        );
        setMoviesLoaded(true);
      },
      () => {
        setRawMovies([]);
        setMoviesLoaded(true);
      },
    );
    const watchLogUnsubscribe = onSnapshot(
      collection(db, "users", user.uid, "watchLog"),
      (snapshot) => {
        const logs = Object.fromEntries(
          snapshot.docs.map((item) => [item.id, item.data()]),
        );
        setWatchLogs(logs);
        setWatchedIds(
          snapshot.docs
            .filter((item) => item.data()?.isWatched)
            .map((item) => item.id),
        );
      },
    );
    return () => {
      listUnsubscribe();
      moviesUnsubscribe();
      watchLogUnsubscribe();
    };
  }, [authLoading, listId, router, user]);

  useEffect(() => {
    let active = true;
    if (!moviesLoaded)
      return () => {
        active = false;
      };
    if (!rawMovies.length) {
      Promise.resolve().then(() => {
        if (!active) return;
        setMovies([]);
        setLoading(!listLoaded);
      });
      return () => {
        active = false;
      };
    }
    const { tmdb } = getLanguageConfig(language);
    fetchAndCacheMovies(
      rawMovies.map((movie) => movie.movieId || movie.id),
      tmdb,
      region,
    ).then((localizedById) => {
      const nextMovies = rawMovies.map((savedMovie) => {
        const movieId = String(savedMovie.movieId || savedMovie.id);
        const localizedMovie = localizedById.get(movieId);
        return localizedMovie
          ? { ...savedMovie, ...localizedMovie, id: movieId }
          : { ...savedMovie, id: movieId };
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

  const displayMovies = useMemo(
    () =>
      movies
        .map((movie) => ({
          ...movie,
          ...(watchLogs[movie.id] || {}),
          isWatched: watchedIds.includes(movie.id),
        }))
        .filter(
          (movie) =>
            id !== "wishlist" || wishlistFilter === "all" || !movie.isWatched,
        ),
    [id, movies, watchLogs, watchedIds, wishlistFilter],
  );

  if (authLoading || !user) return <PageLoading />;
  if (loading)
    return (
      <div
        className="mx-auto max-w-[1480px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9"
        aria-label={language === "tr" ? "Liste yükleniyor" : "Loading list"}
        aria-busy="true"
      >
        <Skeleton className="mb-4" width="12rem" height="2rem" />
        <Skeleton className="mb-8" width="18rem" height="1rem" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
          {Array.from({ length: 10 }, (_, index) => (
            <Skeleton
              key={index}
              className="aspect-[2/3]"
              width="100%"
              height="auto"
            />
          ))}
        </div>
      </div>
    );

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
      <ListHeader
        list={list}
        count={
          id === "wishlist" || id === "watched"
            ? mediaTab === "movie"
              ? displayMovies.length
              : tvItems.length
            : displayMovies.length + tvItems.length
        }
        language={language}
        t={t}
        onEdit={() => router.push("/lists")}
      />
      {(id === "wishlist" || id === "watched") && (
        <div
          className="mb-5 flex gap-2"
          role="group"
          aria-label={language === "tr" ? "İçerik türü" : "Media type"}
        >
          {[
            ["movie", language === "tr" ? "Filmler" : "Movies"],
            ["tv", language === "tr" ? "Diziler" : "Series"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setMediaTab(value);
                const url = new URL(window.location.href);
                url.searchParams.set("type", value);
                window.history.replaceState(null, "", url);
              }}
              aria-pressed={mediaTab === value}
              className={`rounded-full border border-border px-4 py-2 ${mediaTab === value ? "bg-accent text-bg" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {id === "wishlist" && mediaTab === "movie" && (
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="group"
          aria-label={
            language === "tr" ? "Wishlist filtresi" : "Watchlist filter"
          }
        >
          {[
            { value: "all", label: language === "tr" ? "Tümü" : "All" },
            {
              value: "unwatched",
              label: language === "tr" ? "İzlemediklerim" : "Unwatched",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setWishlistFilter(option.value)}
              aria-pressed={wishlistFilter === option.value}
              className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${wishlistFilter === option.value ? "border-accent bg-accent text-bg" : "border-border text-muted hover:border-accent hover:text-text"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      {(mediaTab === "movie" || (id !== "wishlist" && id !== "watched")) &&
        (displayMovies.length > 0 ||
          ((id === "wishlist" || id === "watched") && mediaTab === "movie") ||
          (!tvLoading && !tvItems.length)) && (
          <ListMovieGrid
            movies={displayMovies}
            language={language}
            watchedLabel={t("profile.watched")}
            t={t}
            isWatchedList={id === "watched"}
          />
        )}
      {tvLoading && (
        <p role="status" className="text-muted">
          {language === "tr" ? "Diziler yükleniyor…" : "Loading series…"}
        </p>
      )}
      {tvError && (
        <div role="alert" className="text-danger">
          <p>
            {language === "tr"
              ? "Diziler yüklenemedi."
              : "Could not load series."}
          </p>
          <button
            className="min-h-11 underline"
            onClick={() => setTvRetry((x) => x + 1)}
          >
            {language === "tr" ? "Yeniden dene" : "Retry"}
          </button>
        </div>
      )}
      {!tvLoading && !tvError && mediaTab === "tv" && tvItems.length === 0 && (
        <p className="text-muted">
          {language === "tr" ? "Henüz dizi yok." : "No series yet."}
        </p>
      )}
      {(mediaTab === "tv" || (id !== "wishlist" && id !== "watched")) &&
        tvItems.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-bold">
              {language === "tr" ? "Diziler" : "Series"}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {tvItems.map(({ series, state, watchedCount }) => (
                <SeriesCard
                  key={series.id}
                  show={series}
                  status={state?.status}
                  watchedCount={watchedCount}
                  tr={language === "tr"}
                />
              ))}
            </div>
          </section>
        )}
    </div>
  );
}
