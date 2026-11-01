"use client";

import { use, useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, onSnapshot } from "@/lib/store-client";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db-client";
import { fetchAndCacheMovie } from "@/lib/tmdb";
import { getLanguageConfig, translate } from "@/lib/i18n";
import PublicListDetailView from "@/components/pages/public-profile/PublicListDetailView";
import PageLoading from "@/components/ui/PageLoading";

function LoadingState() {
  return <PageLoading />;
}

function NotFoundState({ t }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-5 text-center text-text">
      <h1 className="font-syne text-2xl font-bold">{t("publicProfile.notFound")}</h1>
      <p className="max-w-sm text-sm text-muted">{t("publicProfile.empty")}</p>
    </main>
  );
}

export default function PublicListDetailPage(props: { params: Promise<{ id: string; listId: string }> }) {
  const params = use(props.params);
  const targetUid = params.id;
  const listId = params.listId;
  const { user, loading: authLoading, language, region } = useAuth();
  const { movies: myMovies, watchedMovieIds, listMovies } = useAppData();
  const router = useRouter();
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);
  const [list, setList] = useState(null);
  const [ownerName, setOwnerName] = useState("User");
  const [rawMovies, setRawMovies] = useState([]);
  const [watchedIds, setWatchedIds] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const viewerWatchedSet = useMemo(() => new Set((watchedMovieIds || []).map((movieId) => String(movieId))), [watchedMovieIds]);
  const viewerListSet = useMemo(() => new Set([
    ...(myMovies || []).map((movie) => String(movie.id)),
    ...Object.values(listMovies || {}).flat().map((movie) => String(movie.id)),
  ]), [listMovies, myMovies]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && user?.uid === targetUid) router.replace(`/lists/${listId}`);
  }, [authLoading, listId, router, targetUid, user]);

  useEffect(() => {
    if (!user || !targetUid || !listId || user.uid === targetUid) return undefined;
    getDoc(doc(db, "users", targetUid)).then((snapshot) => {
      if (snapshot.exists()) setOwnerName(snapshot.data()?.displayName || "User");
    });

    if (listId === "watched") {
      return onSnapshot(
        collection(db, "users", targetUid, "watchLog"),
        (snapshot) => {
          const watchedMovies = snapshot.docs
            .filter((item) => item.data()?.isWatched)
            .map((item) => {
              const data = item.data();
              return { ...data, id: item.id, movieId: String(data.movieId || item.id) };
            });
          setList({ id: "watched", name: "Watched", type: "default", visibility: "public" });
          setRawMovies(watchedMovies);
          setMoviesLoading(false);
          setLoading(false);
        },
        () => {
          setList(false);
          setRawMovies([]);
          setMoviesLoading(false);
          setLoading(false);
        },
      );
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", targetUid, "lists", listId),
      (snapshot) => {
        if (!snapshot.exists() || snapshot.data()?.visibility !== "public") {
          setList(false);
          setLoading(false);
          return;
        }
        setList({ id: snapshot.id, ...snapshot.data() });
        setLoading(false);
      },
      () => {
        setList(false);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [listId, targetUid, user]);

  useEffect(() => {
    if (!user || !targetUid || user.uid === targetUid) return undefined;
    return onSnapshot(
      collection(db, "users", targetUid, "watchLog"),
      (snapshot) => setWatchedIds(snapshot.docs.filter((item) => item.data()?.isWatched).map((item) => item.id)),
    );
  }, [targetUid, user]);

  useEffect(() => {
    if (!list || list === false || listId === "watched") return undefined;
    const unsubscribe = onSnapshot(
      collection(db, "users", targetUid, "lists", listId, "movies"),
      (snapshot) => {
        setRawMovies(snapshot.docs.map((movieDoc) => ({ id: movieDoc.id, ...movieDoc.data() })));
        setMoviesLoading(false);
      },
      () => {
        setRawMovies([]);
        setMoviesLoading(false);
      },
    );
    return () => unsubscribe();
  }, [list, listId, targetUid]);

  useEffect(() => {
    let active = true;
    const { tmdb } = getLanguageConfig(language);
    Promise.all(rawMovies.map(async (savedMovie) => {
      const movieId = savedMovie.movieId || savedMovie.id;
      const normalizedMovieId = String(movieId);
      const localizedMovie = await fetchAndCacheMovie(movieId, tmdb, region);
      return localizedMovie
        ? {
            ...savedMovie,
            ...localizedMovie,
            id: normalizedMovieId,
            ownerWatched: watchedIds.includes(normalizedMovieId),
            viewerWatched: viewerWatchedSet.has(normalizedMovieId),
            inViewerList: viewerListSet.has(normalizedMovieId),
          }
        : {
            ...savedMovie,
            id: normalizedMovieId,
            ownerWatched: watchedIds.includes(normalizedMovieId),
            viewerWatched: viewerWatchedSet.has(normalizedMovieId),
            inViewerList: viewerListSet.has(normalizedMovieId),
          };
    })).then((nextMovies) => {
      if (active) setMovies(nextMovies);
    });
    return () => { active = false; };
  }, [language, rawMovies, region, viewerListSet, viewerWatchedSet, watchedIds]);

  if (authLoading || !user || loading || (list && moviesLoading)) return <LoadingState />;
  if (list === false || !list) return <NotFoundState t={t} />;

  return <PublicListDetailView targetUid={targetUid} ownerName={ownerName} list={list} movies={movies} language={language} t={t} />;
}
