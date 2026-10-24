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

function FriendsSection({ friends = [], onShare, t }) {
  return (
    <section className="border-b border-border py-6" aria-labelledby="friends-title">
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
          {t("profile.addFriend")}
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
        <div className="border border-dashed border-border px-4 py-6 text-center">
          <Users size={24} className="mx-auto mb-2 text-faint" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted">
            Profil linkini paylaşarak arkadaş ekleyebilirsin. {" "}
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

function Attribution() {
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
      <p className="max-w-xs text-xs leading-relaxed text-faint">
        Bu uygulama TMDB API&apos;sini kullanmaktadır ancak TMDB tarafından onaylanmamıştır.
      </p>
    </footer>
  );
}

export default function ProfileView({
  user,
  language,
  region,
  movies,
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
    <main className="min-h-full overflow-hidden bg-bg px-4 pb-24 pt-5 text-text sm:px-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <ProfileHeader user={user} movies={recentlyWatched} onShare={onShare} onLogout={onLogout} t={t} />
        <StatsRow movies={movies} watchedCount={watched.length} wishlistCount={wishlist.length} average={avgRating} t={t} />
        <RecentlyWatched movies={recentlyWatched} t={t} />
        <FriendsSection friends={friends} onShare={onShare} t={t} />
        <div className="py-6">
          <PreferencesSection
            language={language}
            region={region}
            onChange={onPreferenceChange}
            status={preferenceStatus}
            t={t}
          />
        </div>
        <Attribution />
      </div>
    </main>
  );
}
