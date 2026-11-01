"use client";

import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, use } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import PublicProfileView, {
  PublicProfileLoading,
  PublicProfileNotFound,
} from "@/components/pages/public-profile/PublicProfileView";
import { fetchAndCacheMovie } from "@/lib/tmdb";
import { getLanguageConfig, translate } from "@/lib/i18n";
import { generateListId } from "@/lib/user-lists";

export default function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const targetUid = params.id;
  const { user, loading: authLoading, language, region } = useAuth();
  const { movies: myMovies, watchedMovieIds, listMovies } = useAppData();
  const router = useRouter();
  const [targetUser, setTargetUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publicLists, setPublicLists] = useState([]);
  const [publicListMovies, setPublicListMovies] = useState({});
  const [rawPublicListMovies, setRawPublicListMovies] = useState({});
  const [publicWatchedMovies, setPublicWatchedMovies] = useState([]);
  const [publicWatchedIds, setPublicWatchedIds] = useState([]);
  const [copyingListId, setCopyingListId] = useState(null);
  const [copyStatus, setCopyStatus] = useState({ id: null, state: "idle" });
  const viewerWatchedSet = useMemo(() => new Set((watchedMovieIds || []).map((movieId) => String(movieId))), [watchedMovieIds]);
  const viewerListSet = useMemo(() => new Set([
    ...(myMovies || []).map((movie) => String(movie.id)),
    ...Object.values(listMovies || {}).flat().map((movie) => String(movie.id)),
  ]), [listMovies, myMovies]);
  const visiblePublicLists = useMemo(() => {
    const storedWatchedList = publicLists.find((list) => list.id === "watched");
    const otherLists = publicLists.filter((list) => list.id !== "watched");
    if (!storedWatchedList && !publicWatchedMovies.length) return publicLists;
    return [...otherLists, storedWatchedList || { id: "watched", name: "Watched", type: "default", visibility: "public", showOnHome: false }];
  }, [publicLists, publicWatchedMovies.length]);

  // ── Authentication and subscriptions ────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (user === null) {
      router.push("/login");
      return;
    }
    if (user && user.uid === targetUid) {
      router.replace("/profile");
      return;
    }
    if (user && targetUid) {
      const fetchUser = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", targetUid));
          setTargetUser(userDoc.exists() ? userDoc.data() : false);
        } catch (error) {
          console.error("Error fetching user:", error);
          setTargetUser(false);
        }
      };
      fetchUser();

      const friendRef = doc(db, "users", user.uid, "friends", targetUid);
      const unsubscribeFriend = onSnapshot(friendRef, (docSnap) => {
        setIsFriend(docSnap.exists());
        setLoading(false);
      });
      const publicListsQ = query(
        collection(db, "users", targetUid, "lists"),
        where("visibility", "==", "public"),
      );
      const listMovieUnsubscribes = new Map();
      const unsubscribePublicLists = onSnapshot(publicListsQ, (snapshot) => {
        const nextLists = snapshot.docs.map((listDoc) => ({ id: listDoc.id, ...listDoc.data() }));
        setPublicLists(nextLists);
        listMovieUnsubscribes.forEach((unsubscribe) => unsubscribe());
        listMovieUnsubscribes.clear();
        nextLists.forEach((list) => {
          const unsubscribeMovies = onSnapshot(
            collection(db, "users", targetUid, "lists", list.id, "movies"),
            (movieSnapshot) => {
              setRawPublicListMovies((current) => ({
                ...current,
                [list.id]: movieSnapshot.docs.map((movieDoc) => ({ id: movieDoc.id, ...movieDoc.data() })),
              }));
            },
          );
          listMovieUnsubscribes.set(list.id, unsubscribeMovies);
        });
      });
      const unsubscribePublicWatchLog = onSnapshot(
        collection(db, "users", targetUid, "watchLog"),
        (snapshot) => {
          const watchedMovies = snapshot.docs
            .filter((item) => item.data()?.isWatched)
            .map((item) => {
              const data = item.data();
              return { ...data, id: item.id, movieId: String(data.movieId || item.id) };
            });
          setPublicWatchedMovies(watchedMovies);
          setPublicWatchedIds(watchedMovies.map((movie) => movie.id));
        },
      );
      return () => {
        unsubscribeFriend();
        unsubscribePublicLists();
        unsubscribePublicWatchLog();
        listMovieUnsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    }
  }, [user, authLoading, router, targetUid]);

  useEffect(() => {
    let active = true;
    const { tmdb } = getLanguageConfig(language);
    Promise.all(visiblePublicLists.map(async (list) => {
      const sourceMovies = list.id === "watched" ? publicWatchedMovies : rawPublicListMovies[list.id] || [];
      const localizedMovies = await Promise.all(sourceMovies.map(async (savedMovie) => {
        const movieId = savedMovie.movieId || savedMovie.id;
        const normalizedMovieId = String(movieId);
        const localizedMovie = await fetchAndCacheMovie(movieId, tmdb, region);
        return localizedMovie
          ? {
              ...savedMovie,
              ...localizedMovie,
              id: normalizedMovieId,
              ownerWatched: publicWatchedIds.includes(normalizedMovieId),
              viewerWatched: viewerWatchedSet.has(normalizedMovieId),
              inViewerList: viewerListSet.has(normalizedMovieId),
            }
          : {
              ...savedMovie,
              id: normalizedMovieId,
              ownerWatched: publicWatchedIds.includes(normalizedMovieId),
              viewerWatched: viewerWatchedSet.has(normalizedMovieId),
              inViewerList: viewerListSet.has(normalizedMovieId),
            };
      }));
      return [list.id, localizedMovies];
    })).then((entries) => {
      if (active) setPublicListMovies(Object.fromEntries(entries));
    });
    return () => { active = false; };
  }, [language, publicWatchedIds, publicWatchedMovies, rawPublicListMovies, region, viewerListSet, viewerWatchedSet, visiblePublicLists]);

  // ── Controller actions ─────────────────────────────────────────────────
  const handleToggleFriend = async () => {
    try {
      const friendRef = doc(db, "users", user.uid, "friends", targetUid);
      const reverseFriendRef = doc(db, "users", targetUid, "friends", user.uid);
      if (isFriend) {
        await deleteDoc(friendRef);
        await deleteDoc(reverseFriendRef);
      } else {
        await setDoc(friendRef, {
          uid: targetUid,
          displayName: targetUser.displayName || "",
          photoURL: targetUser.photoURL || "",
          addedAt: serverTimestamp(),
        });
        await setDoc(reverseFriendRef, {
          uid: user.uid,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          addedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error toggling friend:", error);
      alert("Bir hata oluştu.");
    }
  };

  const handleStartChat = async () => {
    try {
      const chatId = [user.uid, targetUid].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists())
        await setDoc(chatRef, {
          participants: [user.uid, targetUid].sort(),
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
          lastMessageSenderId: "",
        });
      router.push(`/messages/${chatId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Sohbet başlatılırken bir hata oluştu.");
    }
  };

  const handleCopyList = async (list) => {
    if (!user || copyingListId) return;
    setCopyingListId(list.id);
    setCopyStatus({ id: list.id, state: "saving" });
    try {
      const copiedListId = generateListId();
      const sourceMovies = list.id === "watched" ? publicWatchedMovies : rawPublicListMovies[list.id] || [];
      const sourceName = list.name || (list.id === "wishlist" ? "Wishlist" : "Liste");
      await setDoc(doc(db, "users", user.uid, "lists", copiedListId), {
        id: copiedListId,
        name: `${sourceName} (kopya)`,
        type: "custom",
        visibility: "private",
        showOnHome: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        schemaVersion: 1,
      });
      await Promise.all(sourceMovies.map(async (movie) => {
        const { id: sourceDocumentId, ...movieData } = movie;
        const movieId = String(movie.movieId || sourceDocumentId);
        if (!movieId) return;
        await setDoc(doc(db, "users", user.uid, "lists", copiedListId, "movies", movieId), {
          ...movieData,
          movieId,
          addedAt: movie.addedAt || Date.now(),
        }, { merge: true });
      }));
      setCopyStatus({ id: list.id, state: "saved" });
    } catch (error) {
      console.error("Error copying public list:", error);
      setCopyStatus({ id: list.id, state: "error" });
    } finally {
      setCopyingListId(null);
    }
  };

  // ── Loading and not-found states ────────────────────────────────────────
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);
  if (authLoading || !user || loading) return <PublicProfileLoading />;
  if (targetUser === false) return <PublicProfileNotFound t={t} />;
  if (!targetUser) return null;

  // ── Presentational view ─────────────────────────────────────────────────
  return (
    <PublicProfileView
      targetUser={targetUser}
      isFriend={isFriend}
      targetUid={targetUid}
      ownerName={targetUser.displayName}
      onBack={() => router.back()}
      onToggleFriend={handleToggleFriend}
      onStartChat={handleStartChat}
      onCopyList={handleCopyList}
      copyingListId={copyingListId}
      copyStatus={copyStatus}
      t={t}
      publicLists={visiblePublicLists}
      publicListMovies={publicListMovies}
    />
  );
}
