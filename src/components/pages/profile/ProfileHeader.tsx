import Image from "next/image";
import { LogOut, Share2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

function getPosterUrl(movie) {
  const poster = movie?.posterPath || movie?.poster_path;
  return poster ? `https://image.tmdb.org/t/p/w780${poster}` : null;
}

export default function ProfileHeader({ user, movies = [], onShare, onLogout, t }) {
  const backgroundMovies = movies.map(getPosterUrl).filter(Boolean).slice(0, 4);

  return (
    <header className="relative isolate overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
      <div className="absolute inset-0 z-0 grid grid-cols-2 opacity-40" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="relative min-h-32 overflow-hidden bg-surface-2">
            {backgroundMovies[index] && (
              <Image
                src={backgroundMovies[index]}
                alt=""
                fill
                sizes="50vw"
                unoptimized
                className="scale-110 object-cover blur-2xl"
              />
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-bg via-bg/90 to-bg/55" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar
            user={user}
            size={88}
            alt={user.displayName || user.email || "Profile avatar"}
            className="border-2 border-accent/60 shadow-[0_0_0_6px_var(--color-accent-glow)]"
          />
          <div className="min-w-0">
            <h1 className="truncate font-syne text-2xl font-bold text-text sm:text-3xl">
              {user.displayName || "Kullanıcı"}
            </h1>
            <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface/80 px-4 text-sm font-semibold text-text transition-colors hover:border-accent/60 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex-none"
          >
            <Share2 size={17} aria-hidden="true" />
            {t("profile.share")}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-danger/50 bg-danger/10 px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger sm:flex-none"
          >
            <LogOut size={17} aria-hidden="true" />
            {t("profile.logout")}
          </button>
        </div>
      </div>
    </header>
  );
}
