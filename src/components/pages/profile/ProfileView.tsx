import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ProfileHeader from "@/components/pages/profile/ProfileHeader";
import StatsRow from "@/components/pages/profile/StatsRow";
import RecentlyWatched from "@/components/pages/profile/RecentlyWatched";
import PreferencesSection from "@/components/pages/profile/PreferencesSection";
import PageLoading from "@/components/ui/PageLoading";
import HorizontalMovieRail from "@/components/HorizontalMovieRail";

export function ProfileLoading() {
  return <PageLoading label="Profil yükleniyor" />;
}

function FriendsSection({ friends = [], onShare, t, language }) {
  const isEnglish = language === "en";
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6" aria-labelledby="friends-title">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <Users size={18} className="shrink-0 text-accent" aria-hidden="true" />
          <h2 id="friends-title" className="font-syne text-xl font-bold text-text">
            {t("profile.friends")}
          </h2>
          <span className="rounded-full bg-surface-2 px-2 py-1 text-xs font-semibold text-muted">{friends.length}</span>
        </div>
        <button
          type="button"
          onClick={onShare}
          className="min-h-11 rounded-[var(--radius-md)] px-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {t("profile.share")}
        </button>
      </div>

      {friends.length ? (
        <HorizontalMovieRail className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {friends.map((friend) => (
            <Link
              key={friend.id}
              href={`/u/${friend.uid}`}
              className="group flex w-16 shrink-0 flex-col items-center gap-2 rounded-[var(--radius-md)] p-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Avatar
                user={friend}
                size={56}
                alt={friend.displayName || "Friend avatar"}
                className="border border-border transition-transform duration-200 group-hover:scale-105"
              />
              <span className="w-full truncate text-xs font-semibold text-muted group-hover:text-text">
                {friend.displayName?.split(" ")[0] || "User"}
              </span>
            </Link>
          ))}
        </HorizontalMovieRail>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-bg px-4 py-6 text-center">
          <Users size={24} className="mx-auto mb-2 text-faint" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted">
            {isEnglish ? "Share your profile link to connect with friends." : "Profil linkini paylaşarak arkadaş ekleyebilirsin."}{" "}
            <button
              type="button"
              onClick={onShare}
              className="font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("profile.share")}
            </button>
          </p>
        </div>
      )}
    </section>
  );
}

function Attribution({ t }) {
  return (
    <footer className="flex flex-col items-center gap-2 py-8 text-center">
      <a
        href="https://www.themoviedb.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-50 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Image
          src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
          alt="TMDB Logo"
          width={80}
          height={11}
          unoptimized
        />
      </a>
      <p className="max-w-xs text-xs leading-relaxed text-faint">{t("profile.attribution")}</p>
    </footer>
  );
}

export default function ProfileView({
  user,
  language,
  region,
  movies,
  series = [],
  friends,
  watched,
  wishlist,
  avgRating,
  recentlyWatched,
  preferenceStatus,
  onPreferenceChange,
  onShare,
  onLogout,
  t,
}) {
  return (
    <main className="min-h-full overflow-hidden bg-bg px-4 py-7 text-text sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1320px]">
        <ProfileHeader user={user} language={language} movies={recentlyWatched} onShare={onShare} onLogout={onLogout} t={t} />
        <StatsRow movies={movies} watchedCount={watched.length} wishlistCount={wishlist.length} average={avgRating} t={t} />
        <section className="mt-5 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-xl font-bold">{language === "tr" ? "Dizi arşivi" : "Series archive"}</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
            <Link className="hover:text-accent" href="/lists/wishlist?type=tv">{language === "tr" ? "İzlenecek" : "Watchlist"}: {series.filter((row) => row.state.status === "watchlist").length}</Link>
            <Link className="hover:text-accent" href="/lists/watched?type=tv">{language === "tr" ? "Tamamlanan" : "Completed"}: {series.filter((row) => row.state.status === "completed").length}</Link>
            <Link className="hover:text-accent" href="/tv">{language === "tr" ? "Tüm diziler" : "All series"}: {series.length}</Link>
          </div>
        </section>
        <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:items-start">
          <div className="min-w-0"><RecentlyWatched movies={recentlyWatched} t={t} /></div>
          <div className="min-w-0 space-y-5">
            <FriendsSection friends={friends} onShare={onShare} t={t} language={language} />
            <PreferencesSection language={language} region={region} onChange={onPreferenceChange} status={preferenceStatus} t={t} />
          </div>
        </div>
        <Attribution t={t} />
      </div>
    </main>
  );
}
