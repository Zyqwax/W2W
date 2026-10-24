import { ArrowLeft } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import FriendshipButton from "./FriendshipButton";

export default function PublicProfileHeader({ targetUser, isFriend, onBack, onToggleFriend, onStartChat, t }) {
  return (
    <header className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_0%,var(--color-accent-glow),transparent_42%),linear-gradient(140deg,var(--color-surface),var(--color-bg))]" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl px-4 pb-7 pt-4 sm:px-6 sm:pb-9 md:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          {t("publicProfile.back")}
        </button>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar
              user={targetUser}
              size={88}
              alt={targetUser.displayName || "Profile avatar"}
              className="border-2 border-accent/60 shadow-[0_0_0_6px_var(--color-accent-glow)]"
            />
            <div className="min-w-0">
              <p className="mb-1 text-sm font-semibold text-accent">{t("publicProfile.watchedMovies")}</p>
              <h1 className="truncate font-syne text-2xl font-bold text-text sm:text-3xl">
                {targetUser.displayName || "Kullanıcı"}
              </h1>
              <p className="mt-1 text-sm text-muted">{targetUser.displayName ? `${targetUser.displayName}'s Wishlist` : "Wishlist"}</p>
            </div>
          </div>

          <FriendshipButton
            isFriend={isFriend}
            onToggleFriend={onToggleFriend}
            onStartChat={onStartChat}
            t={t}
          />
        </div>
      </div>
    </header>
  );
}
