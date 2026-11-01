"use client";

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { db } from "@/lib/db-client";
import { collection, query, onSnapshot, type Unsubscribe } from "@/lib/store-client";
import { useAuth } from "@/context/AuthContext";
import { fetchAndCacheMovie } from "@/lib/tmdb";
import { getLanguageConfig } from "@/lib/i18n";
import { ensureDefaultLists } from "@/lib/user-lists";
import type { AppDataContextType, Movie, Friend, UserList } from "@/types";

const AppDataContext = createContext<AppDataContextType>({
  movies: undefined,
  friends: [],
  moviesLoading: true,
  friendsLoading: true,
  lists: [],
  listMovies: {},
  watchedMovieIds: [],
});

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, language, region } = useAuth();
  const [movies, setMovies] = useState<Movie[] | undefined>(undefined);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [lists, setLists] = useState<UserList[]>([]);
  const [listMovies, setListMovies] = useState<Record<string, Movie[]>>({});
  const [watchedMovieIds, setWatchedMovieIds] = useState<(string | number)[]>([]);

  // Keep refs to unsubscribe functions so we don't re-create listeners unnecessarily
  const unsubMoviesRef = useRef<(() => void) | null>(null);
  const unsubFriendsRef = useRef<Unsubscribe | null>(null);
  const currentSubscriptionRef = useRef<string | null>(null);
  const listMovieUnsubsRef = useRef<Map<string, Unsubscribe>>(new Map());
  const watchLogRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    // If no user (logged out), clear everything and unsubscribe
    if (!user) {
      if (unsubMoviesRef.current) {
        unsubMoviesRef.current();
        unsubMoviesRef.current = null;
      }
      if (unsubFriendsRef.current) {
        unsubFriendsRef.current();
        unsubFriendsRef.current = null;
      }
      listMovieUnsubsRef.current.forEach((unsubscribe) => unsubscribe());
      listMovieUnsubsRef.current.clear();
      watchLogRef.current = new Map();
      const timeoutId = setTimeout(() => {
        setMovies(undefined);
        setFriends([]);
        setMoviesLoading(true);
        setFriendsLoading(true);
        setLists([]);
        setListMovies({});
        setWatchedMovieIds([]);
      }, 0);
      currentSubscriptionRef.current = null;
      return () => clearTimeout(timeoutId);
    }

    // Re-subscribe when the locale changes so cached movie metadata is localized.
    const subscriptionKey = `${user.uid}:${language}:${region}`;
    if (subscriptionKey === currentSubscriptionRef.current) return;
    currentSubscriptionRef.current = subscriptionKey;

    // Clean up any previous listeners (e.g. after account switch)
    if (unsubMoviesRef.current) unsubMoviesRef.current();
    if (unsubFriendsRef.current) unsubFriendsRef.current();
    listMovieUnsubsRef.current.forEach((unsubscribe) => unsubscribe());
    listMovieUnsubsRef.current.clear();
    watchLogRef.current = new Map();

    ensureDefaultLists(user.uid).catch((error) => console.error("Default lists error:", error));

    // Combine wishlist movies and watchLog items so that profile and home see both wishlist and watched items
    const wishlistQ = query(collection(db, "users", user.uid, "lists", "wishlist", "movies"));
    const watchLogQ = query(collection(db, "users", user.uid, "watchLog"));
    let active = true;
    let savedWishlistMovies: any[] = [];
    let watchLog = new Map<string, any>();
    const { tmdb } = getLanguageConfig(language);
    const refreshMovies = async () => {
      // Gather unique movie IDs from wishlist and watchLog
      const allMovieMap = new Map<string, any>();
      savedWishlistMovies.forEach((m) => {
        allMovieMap.set(String(m.id), { ...m, status: "wishlist" });
      });
      watchLog.forEach((log, movieId) => {
        const idStr = String(movieId);
        const existing = allMovieMap.get(idStr);
        if (log?.isWatched) {
          allMovieMap.set(idStr, { ...(existing || {}), ...log, id: idStr, status: "watched", isWatched: true });
        } else if (existing) {
          allMovieMap.set(idStr, { ...existing, ...log, id: idStr, isWatched: false });
        }
      });

      const movieEntries = Array.from(allMovieMap.values());
      const localizedMovies = await Promise.all(movieEntries.map(async (movieItem) => {
        const localizedMovie = await fetchAndCacheMovie(movieItem.id, tmdb, region);
        return localizedMovie ? { ...movieItem, ...localizedMovie } : movieItem;
      }));
      if (!active) return;
      setMovies(localizedMovies);
      setMoviesLoading(false);
    };
    const unsubWishlist = onSnapshot(wishlistQ, (snapshot) => {
      savedWishlistMovies = snapshot.docs.map((movieDoc) => ({ id: movieDoc.id, ...movieDoc.data() }));
      refreshMovies();
    }, () => { if (active) setMoviesLoading(false); });
    const unsubWatchLog = onSnapshot(watchLogQ, (snapshot) => {
      watchLog = new Map(snapshot.docs.map((logDoc) => [logDoc.id, logDoc.data()]));
      watchLogRef.current = watchLog;
      const watchedIds = [...watchLog.entries()]
        .filter(([, log]) => log?.isWatched)
        .map(([movieId]) => movieId);
      setWatchedMovieIds(watchedIds);
      setListMovies((current) => Object.fromEntries(
        Object.entries(current).map(([listId, listItems]) => [
          listId,
          listItems.map((movie) => ({ ...movie, isWatched: watchedIds.includes(String(movie.id)) })),
        ]),
      ));
      refreshMovies();
    });
    unsubMoviesRef.current = () => { unsubWishlist(); unsubWatchLog(); };

    const listsQ = query(collection(db, "users", user.uid, "lists"));
    const unsubLists = onSnapshot(listsQ, (snapshot) => {
      const nextLists = snapshot.docs.map((listDoc) => ({ id: listDoc.id, ...listDoc.data() } as UserList));
      setLists(nextLists);
      listMovieUnsubsRef.current.forEach((unsubscribe) => unsubscribe());
      listMovieUnsubsRef.current.clear();
      setListMovies({});
      nextLists.filter((list) => list.type === "custom").forEach((list) => {
        const moviesQ = query(collection(db, "users", user.uid, "lists", list.id, "movies"));
        const unsubscribe = onSnapshot(moviesQ, async (snapshot) => {
          const rawMovies = snapshot.docs.map((movieDoc) => ({ id: movieDoc.id, ...movieDoc.data() }));
          const localizedMovies = await Promise.all(rawMovies.map(async (savedMovie) => {
            const localizedMovie = await fetchAndCacheMovie(savedMovie.id, tmdb, region);
            const log = watchLogRef.current.get(savedMovie.id);
            return localizedMovie
              ? { ...savedMovie, ...localizedMovie, isWatched: Boolean(log?.isWatched) }
              : { ...savedMovie, isWatched: Boolean(log?.isWatched) };
          }));
          if (active) setListMovies((current) => ({ ...current, [list.id]: localizedMovies }));
        });
        listMovieUnsubsRef.current.set(list.id, unsubscribe);
      });
    });

    // Start listening to friends
    const friendsQ = query(collection(db, "users", user.uid, "friends"));
    unsubFriendsRef.current = onSnapshot(friendsQ, (snapshot) => {
      const data: Friend[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Friend));
      setFriends(data);
      setFriendsLoading(false);
    }, () => {
      setFriendsLoading(false);
    });

    const listMovieUnsubs = listMovieUnsubsRef.current;
    return () => {
      active = false;
      unsubLists();
      listMovieUnsubs.forEach((unsubscribe) => unsubscribe());
      listMovieUnsubs.clear();
    };
  }, [user, language, region]);

  return (
    <AppDataContext.Provider value={{ movies, friends, moviesLoading, friendsLoading, lists, listMovies, watchedMovieIds }}>
      {children}
    </AppDataContext.Provider>
  );
};
