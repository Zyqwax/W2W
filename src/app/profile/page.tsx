"use client";

import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { translate } from "@/lib/i18n";
import ProfileView, { ProfileLoading } from "@/components/pages/profile/ProfileView";

export default function ProfilePage() {
  const { user, loading, logout, language, region, updatePreferences } = useAuth();
  const { movies, friends } = useAppData();
  const router = useRouter();
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);
  const [preferenceStatus, setPreferenceStatus] = useState("idle");

  // ── Controller actions ─────────────────────────────────────────────────
  const handlePreferenceChange = async (field, value) => {
    setPreferenceStatus("saving");
    try {
      await updatePreferences({ [field]: value });
      setPreferenceStatus("saved");
    } catch (error) {
      console.error("Error saving preferences:", error);
      setPreferenceStatus("error");
    }
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/u/${user.uid}`;
    if (navigator.share) {
      navigator.share({ title: t("profile.shareTitle"), text: t("profile.shareText"), url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => alert(t("profile.copied")));
    }
  };

  // ── Authentication gate ────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && user === null) router.push("/login");
  }, [user, loading, router]);

  if (loading) return <ProfileLoading />;
  if (!user) return null;

  // ── Derived archive data ────────────────────────────────────────────────
  const watched = movies?.filter((movie) => movie.isWatched) || [];
  const wishlist = movies?.filter((movie) => movie.status === "wishlist") || [];
  const ratedMovies = watched.filter((movie) => movie.rating > 0);
  const avgRating =
    ratedMovies.length > 0
      ? (ratedMovies.reduce((sum, movie) => sum + movie.rating, 0) / ratedMovies.length).toFixed(1)
      : null;
  const recentlyWatched = [...watched]
    .filter((movie) => movie.watchedAt != null && movie.watchedAt !== 0)
    .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());

  // ── Presentational view ─────────────────────────────────────────────────
  return (
    <ProfileView
      user={user}
      language={language}
      region={region}
      movies={movies}
      friends={friends}
      watched={watched}
      wishlist={wishlist}
      avgRating={avgRating}
      recentlyWatched={recentlyWatched}
      preferenceStatus={preferenceStatus}
      onPreferenceChange={handlePreferenceChange}
      onShare={handleShareProfile}
      onLogout={logout}
      t={t}
    />
  );
}
