"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { fetchAndCacheMovie, fetchWatchProviders } from "@/lib/tmdb";
import { getLanguageConfig, getRegionLabel, translate } from "@/lib/i18n";
import { db } from "@/lib/db-client";
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
} from "@/lib/store-client";
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
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState("");

  // ─── Data loading ───
  useEffect(() => {
    if (!authLoading && user === null) {
      router.push("/login");
      return;
    }
    if (!user) return;

    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      setLoadError(false);
      setUserData(null);
      setReview("");
      setProvidersLoading(true);
      setProvidersError(false);

      try {
        const languageConfig = getLanguageConfig(language);
        const [movieResult, providerResult, stateResult, listsResult] = await Promise.allSettled([
          fetchAndCacheMovie(movieId, languageConfig.tmdb, region),
          fetchWatchProviders(movieId, region),
          getUserMovieState(user.uid, movieId),
          getDocs(collection(db, "users", user.uid, "lists")),
        ]);
        if (cancelled) return;

        if (movieResult.status === "rejected" || !movieResult.value) {
          setLoadError(true);
          setMovie(null);
          return;
        }

        setMovie(movieResult.value);
        setProviders(providerResult.status === "fulfilled" ? providerResult.value : null);
        setProvidersError(providerResult.status === "rejected" || providerResult.value === null);
        const currentState = stateResult.status === "fulfilled" ? stateResult.value : null;
        setUserData(currentState);
        setReview(currentState?.review || "");
        const listDocs = listsResult.status === "fulfilled" ? listsResult.value.docs : [];
        setCustomLists(listDocs.map((listDoc) => ({ id: listDoc.id, ...listDoc.data() } as any)).filter((list: any) => list.type === "custom"));
      } catch (error) {
        console.error("Failed to load movie page", error);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setProvidersLoading(false);
        }
      }
    };

    void loadData();
    return () => { cancelled = true; };
  }, [user?.uid, authLoading, movieId, router, language, region]);

  // ─── Watch history and status CRUD ───
  const runAction = async (action) => {
    setSaving(true);
    setActionError("");
    try {
      await action();
    } catch (error) {
      console.error("Movie action failed", error);
      setActionError(language === "tr" ? "Kaydedilemedi. Lütfen tekrar dene." : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveWatchedEntry = async (timestampMs) => {
    const addedAt = userData?.addedAt || Date.now();
    const newData = {
      title: movie.title,
      posterPath: movie.posterPath,
      status: "watched",
      watchedAt: timestampMs,
      watchHistory: [{ ts: timestampMs }, ...(userData?.watchHistory || [])],
      rating: userData?.rating || 0,
      review: review || "",
      addedAt,
      isWatched: true,
    };
    await Promise.all([
      removeWishlistMovie(user.uid, movieId),
      saveWatchedMovie(user.uid, movieId, { title: movie.title, posterPath: movie.posterPath, addedAt }),
      saveWatchLog(user.uid, movieId, newData),
    ]);
    setUserData(newData);
  };

  const handlePastDate = async (dateStr) => {
    setShowPastModal(false);
    await runAction(() => saveWatchedEntry(dayjs(dateStr).endOf("day").valueOf()));
  };

  const updateStatus = async (newStatus) => {
    if (newStatus !== "wishlist") return;
    const wishlistData = { title: movie.title, posterPath: movie.posterPath, status: "wishlist", addedAt: userData?.addedAt || Date.now() };
    await Promise.all([
      saveWishlistMovie(user.uid, movieId, wishlistData),
      removeWatchedMovie(user.uid, movieId),
      saveWatchLog(user.uid, movieId, { ...wishlistData, isWatched: false, watchHistory: [] }),
    ]);
    setUserData({ ...wishlistData, status: "wishlist", isWatched: false, watchHistory: [] });
  };

  const removeMovie = async () => {
    await Promise.all([
      removeWishlistMovie(user.uid, movieId),
      removeWatchedMovie(user.uid, movieId),
      removeWatchLog(user.uid, movieId),
    ]);
    setUserData(null);
  };

  const removeWatchEntry = async (idx) => {
    const newHistory = (userData?.watchHistory || []).filter((_, i) => i !== idx);
    const hasHistory = newHistory.length > 0;
    const newData = { ...userData, watchHistory: newHistory, watchedAt: hasHistory ? newHistory[0].ts : null, status: hasHistory ? "watched" : null, isWatched: hasHistory };
    if (hasHistory) {
      await saveWatchLog(user.uid, movieId, newData);
    } else {
      await Promise.all([removeWatchedMovie(user.uid, movieId), saveWatchLog(user.uid, movieId, newData)]);
    }
    setUserData(hasHistory ? newData : null);
  };

  // ─── Rating and review CRUD ───
  const updateRating = async (rating) => {
    if (!userData) return;
    const newData = { ...userData, rating };
    await saveWatchLog(user.uid, movieId, newData);
    setUserData(newData);
  };
  const saveReview = async () => {
    if (!userData) return;
    const newData = { ...userData, review };
    await saveWatchLog(user.uid, movieId, newData);
    setUserData(newData);
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

  if (authLoading || !user || loading) return <PageLoading />;
  if (loadError || !movie) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">W2W</p>
        <h1 className="mt-3 font-syne text-2xl font-bold text-text">{loadError ? (language === "tr" ? "Film bilgisi yüklenemedi" : "Movie details could not be loaded") : t("movie.notFound")}</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted">{language === "tr" ? "Bağlantını kontrol edip tekrar deneyebilir veya önceki sayfaya dönebilirsin." : "Check your connection and try again, or return to the previous page."}</p>
        <button type="button" onClick={() => router.back()} className="mt-5 min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-text transition hover:border-accent/50">{t("common.back")}</button>
      </main>
    );
  }
  const watchHistory = userData?.watchHistory || [];

  return (
    <div className="min-h-full bg-bg pb-10 text-text">
      {showPastModal && <PastDateModal onConfirm={handlePastDate} onClose={() => setShowPastModal(false)} t={t} />}
      <MovieRecommendation
        open={showRecommendModal}
        friends={friends}
        movieTitle={movie.title}
        onClose={() => setShowRecommendModal(false)}
        onSelect={(friendUid) => runAction(() => recommendMovie(friendUid))}
        t={t}
      />
      <MovieHero movie={movie} userStatus={userData?.status} onBack={() => router.back()} t={t} />

      <main className="mx-auto max-w-[1480px] px-4 pb-8 pt-5 sm:px-7 sm:pt-7 lg:px-10">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)] lg:gap-7">
          <aside className="order-1 space-y-4">
            <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <WatchedActions
              userData={userData}
              language={language}
              saving={saving}
              onWatchNow={() => runAction(() => saveWatchedEntry(Date.now()))}
              onWatchPast={() => setShowPastModal(true)}
              onWatchNoDate={() => runAction(() => saveWatchedEntry(null))}
              onUpdateStatus={(status) => runAction(() => updateStatus(status))}
              onRemove={() => runAction(removeMovie)}
              onRecommend={() => setShowRecommendModal(true)}
              onRatingFocus={() => document.getElementById("movie-rating")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              customLists={customLists}
              onAddToCustomList={(listId) => runAction(() => addToCustomList(listId))}
              t={t}
            />
            {actionError && <p role="alert" className="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs leading-5 text-danger">{actionError}</p>}
            </section>
            <section className="rounded-2xl border border-border bg-surface px-4 shadow-sm sm:px-5">
              <ProviderList providers={providers} loading={providersLoading} error={providersError} regionLabel={getRegionLabel(region, language)} t={t} />
            </section>
            {userData?.status === "watched" && (
              <section className="overflow-hidden rounded-2xl border border-border bg-surface px-4 shadow-sm sm:px-5" aria-label={t("movie.rating")}>
                <RatingReview userData={userData} language={language} review={review} saving={saving} onRating={(rating) => runAction(() => updateRating(rating))} onReviewChange={setReview} onSaveReview={() => runAction(saveReview)} t={t} />
                <WatchHistory history={watchHistory} language={language} onRemove={(index) => runAction(() => removeWatchEntry(index))} t={t} />
              </section>
            )}
          </aside>

          <div className="order-2 min-w-0 space-y-4">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7" aria-labelledby="movie-overview-heading">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">{language === "tr" ? "Hikâye" : "The story"}</p>
              <h2 id="movie-overview-heading" className="font-syne text-xl font-bold text-text">{t("movie.overview")}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-muted sm:text-base">{movie.overview || t("movie.missingOverview")}</p>
            </section>

            {movie.cast?.length > 0 && <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7"><CastRow cast={movie.cast} t={t} /></section>}
            {movie.trailer && <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7"><TrailerButton trailer={movie.trailer} t={t} /></section>}
          </div>
        </div>
      </main>
    </div>
  );
}
