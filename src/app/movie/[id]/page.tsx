"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { fetchAndCacheMovie, fetchWatchProviders } from "@/lib/tmdb";
import { getLanguageConfig, getRegionLabel, translate } from "@/lib/i18n";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import "dayjs/locale/en";
import relativeTime from "dayjs/plugin/relativeTime";
import PastDateModal from "@/components/pages/movie-detail/PastDateModal";
import MovieRecommendation from "@/components/pages/movie-detail/MovieRecommendation";
import MovieHero from "@/components/pages/movie/MovieHero";
import PageLoading from "@/components/ui/PageLoading";
import WatchedActions from "@/components/pages/movie/WatchedActions";
import CastRow from "@/components/pages/movie/CastRow";
import TrailerButton from "@/components/pages/movie/TrailerButton";
import ProviderList from "@/components/pages/movie/ProviderList";
import RatingReview from "@/components/pages/movie/RatingReview";
import WatchHistory from "@/components/pages/movie/WatchHistory";
import {
  getUserMovieState,
  removeWishlistMovie,
  removeWatchedMovie,
  removeWatchLog,
  saveWatchLog,
  saveWishlistMovie,
  saveWatchedMovie,
} from "@/lib/user-lists";

dayjs.extend(relativeTime);

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const movieId = unwrappedParams.id;
  const { user, loading: authLoading, language, region } = useAuth();
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);
  const { friends } = useAppData();
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPastModal, setShowPastModal] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [providers, setProviders] = useState(null);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState(false);
  const [customLists, setCustomLists] = useState([]);

  // ─── Data loading ───
  useEffect(() => {
    if (!authLoading && user === null) {
      router.push("/login");
      return;
    }
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setProvidersLoading(true);
      setProvidersError(false);
      const languageConfig = getLanguageConfig(language);
      const [movieData, providerData] = await Promise.all([
        fetchAndCacheMovie(movieId, languageConfig.tmdb, region),
        fetchWatchProviders(movieId, region),
      ]);
      if (cancelled) return;
      setMovie(movieData);
      setProviders(providerData);
      setProvidersError(providerData === null);
      if (user && movieData) {
        const currentState = await getUserMovieState(user.uid, movieId);
        if (currentState) {
          setUserData(currentState);
          setReview(currentState.review || "");
        }
        const listsSnapshot = await getDocs(collection(db, "users", user.uid, "lists"));
        setCustomLists(listsSnapshot.docs.map((listDoc) => ({ id: listDoc.id, ...listDoc.data() } as any)).filter((list: any) => list.type === "custom"));
      }
      setLoading(false);
      setProvidersLoading(false);
    }
    if (user) loadData();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, movieId, router, language, region]);

  // ─── Watch history and status CRUD ───
  const addWatchEntry = async (timestampMs) => {
    setSaving(true);
    const existingHistory = userData?.watchHistory || [];
    const newData = {
      title: movie.title,
      posterPath: movie.posterPath,
      status: "watched",
      watchedAt: timestampMs,
      watchHistory: [{ ts: timestampMs }, ...existingHistory],
      rating: userData?.rating || 0,
      review: review || "",
      addedAt: userData?.addedAt || Date.now(),
      isWatched: true,
    };
    await Promise.all([
      removeWishlistMovie(user.uid, movieId),
      saveWatchedMovie(user.uid, movieId, { title: movie.title, posterPath: movie.posterPath, addedAt: newData.addedAt }),
      saveWatchLog(user.uid, movieId, newData),
    ]);
    setUserData({ ...newData, status: "watched" });
    setSaving(false);
  };

  const addWatchEntryNoDate = async () => {
    setSaving(true);
    const existingHistory = userData?.watchHistory || [];
    const newData = {
      title: movie.title,
      posterPath: movie.posterPath,
      status: "watched",
      watchedAt: null,
      watchHistory: [{ ts: null }, ...existingHistory],
      rating: userData?.rating || 0,
      review: review || "",
      addedAt: userData?.addedAt || Date.now(),
      isWatched: true,
    };
    await Promise.all([
      removeWishlistMovie(user.uid, movieId),
      saveWatchedMovie(user.uid, movieId, { title: movie.title, posterPath: movie.posterPath, addedAt: newData.addedAt }),
      saveWatchLog(user.uid, movieId, newData),
    ]);
    setUserData({ ...newData, status: "watched" });
    setSaving(false);
  };

  const watchNow = () => addWatchEntry(Date.now());
  const handlePastDate = async (dateStr) => {
    setShowPastModal(false);
    await addWatchEntry(dayjs(dateStr).endOf("day").valueOf());
  };

  const updateStatus = async (newStatus) => {
    setSaving(true);
    if (newStatus === "wishlist") {
      const wishlistData = { title: movie.title, posterPath: movie.posterPath, status: "wishlist", addedAt: userData?.addedAt || Date.now() };
      await Promise.all([
        saveWishlistMovie(user.uid, movieId, wishlistData),
        removeWatchedMovie(user.uid, movieId),
        saveWatchLog(user.uid, movieId, { ...wishlistData, isWatched: false, watchHistory: [] }),
      ]);
      setUserData({ ...userData, ...wishlistData, status: "wishlist", isWatched: false, watchHistory: [] });
      setSaving(false);
      return;
    }
    const newData = {
      title: movie.title,
      posterPath: movie.posterPath,
      status: newStatus,
      watchedAt: newStatus === "watched" ? Date.now() : null,
      watchHistory: userData?.watchHistory || [],
      rating: userData?.rating || 0,
      review: review || "",
      addedAt: userData?.addedAt || Date.now(),
      isWatched: true,
    };
    await Promise.all([
      removeWishlistMovie(user.uid, movieId),
      saveWatchedMovie(user.uid, movieId, { title: movie.title, posterPath: movie.posterPath, addedAt: newData.addedAt }),
      saveWatchLog(user.uid, movieId, newData),
    ]);
    setUserData({ ...newData, status: "watched" });
    setSaving(false);
  };

  const removeMovie = async () => {
    setSaving(true);
    await Promise.all([
      removeWishlistMovie(user.uid, movieId),
      removeWatchedMovie(user.uid, movieId),
      removeWatchLog(user.uid, movieId),
    ]);
    setUserData(null);
    setSaving(false);
  };
  const removeWatchEntry = async (idx) => {
    const newHistory = (userData.watchHistory || []).filter((_, i) => i !== idx);
    const hasHistory = newHistory.length > 0;
    const newData = {
      ...userData,
      watchHistory: newHistory,
      watchedAt: hasHistory ? newHistory[0].ts : null,
      status: hasHistory ? "watched" : null,
      isWatched: hasHistory,
    };
    if (hasHistory) {
      await saveWatchLog(user.uid, movieId, newData);
    } else {
      await Promise.all([
        removeWatchedMovie(user.uid, movieId),
        saveWatchLog(user.uid, movieId, newData),
      ]);
    }
    setUserData(newData);
  };

  // ─── Rating and review CRUD ───
  const updateRating = async (rating) => {
    if (!userData) return;
    const newData = { ...userData, rating };
    setUserData(newData);
    await saveWatchLog(user.uid, movieId, newData);
  };
  const saveReview = async () => {
    setSaving(true);
    if (!userData) return;
    const newData = { ...userData, review };
    setUserData(newData);
    await saveWatchLog(user.uid, movieId, newData);
    setSaving(false);
  };

  // ─── Recommendation CRUD ───
  const recommendMovie = async (friendUid) => {
    const chatId = [user.uid, friendUid].sort().join("_");
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists())
      await setDoc(chatRef, {
        participants: [user.uid, friendUid].sort(),
        lastMessage: `🎬 ${movie.title}`,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: user.uid,
        unreadBy: [friendUid],
      });
    else
      await updateDoc(chatRef, {
        lastMessage: `🎬 ${movie.title}`,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: user.uid,
        unreadBy: arrayUnion(friendUid),
      });
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: user.uid,
      text: "",
      type: "movie_recommendation",
      movieId,
      movieTitle: movie.title,
      moviePoster: movie.posterPath,
      createdAt: serverTimestamp(),
    });
    setShowRecommendModal(false);
    router.push(`/messages/${chatId}`);
  };

  const addToCustomList = async (listId) => {
    await setDoc(doc(db, "users", user.uid, "lists", listId, "movies", movieId), {
      movieId,
      title: movie.title,
      posterPath: movie.posterPath,
      addedAt: Date.now(),
    }, { merge: true });
  };

  if (authLoading || !user || loading)
    return <PageLoading />;
  if (!movie) return <div className="mt-10 bg-bg p-4 text-center text-muted">{t("movie.notFound")}</div>;
  const watchHistory = userData?.watchHistory || [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg pb-24 text-text">
      {showPastModal && <PastDateModal onConfirm={handlePastDate} onClose={() => setShowPastModal(false)} t={t} />}
      <MovieRecommendation
        open={showRecommendModal}
        friends={friends}
        movieTitle={movie.title}
        onClose={() => setShowRecommendModal(false)}
        onSelect={recommendMovie}
        t={t}
      />
      <MovieHero movie={movie} onBack={() => router.back()} t={t} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 md:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10">
          <aside className="order-1 self-start lg:sticky lg:top-6">
            <WatchedActions
              userData={userData}
              language={language}
              saving={saving}
              onWatchNow={watchNow}
              onWatchPast={() => setShowPastModal(true)}
              onWatchNoDate={addWatchEntryNoDate}
              onUpdateStatus={updateStatus}
              onRemove={removeMovie}
              onRecommend={() => setShowRecommendModal(true)}
              onRatingFocus={() => document.getElementById("movie-rating")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              customLists={customLists}
              onAddToCustomList={addToCustomList}
              t={t}
            />
          </aside>

          <div className="order-2 min-w-0 space-y-8">
            <ProviderList
              providers={providers}
              loading={providersLoading}
              error={providersError}
              regionLabel={getRegionLabel(region, language)}
              t={t}
            />

            <section className="space-y-3 border-l-2 border-accent/60 pl-4" aria-labelledby="movie-overview-heading">
              <h2 id="movie-overview-heading" className="font-syne text-xl font-semibold text-text">{t("movie.overview")}</h2>
              <p className="max-w-3xl text-sm leading-7 text-muted">{movie.overview || t("movie.missingOverview")}</p>
            </section>

            <CastRow cast={movie.cast} t={t} />
            <TrailerButton trailer={movie.trailer} t={t} />
            <RatingReview
              userData={userData}
              language={language}
              review={review}
              saving={saving}
              onRating={updateRating}
              onReviewChange={setReview}
              onSaveReview={saveReview}
              t={t}
            />
            <WatchHistory history={watchHistory} language={language} onRemove={removeWatchEntry} t={t} />
          </div>
        </div>
      </main>
    </div>
  );
}
