import { MessageCircle, UserCheck, UserPlus } from "lucide-react";

export default function FriendshipButton({ isFriend, onToggleFriend, onStartChat, t }) {
  if (isFriend) {
    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={onToggleFriend}
          aria-label={t("publicProfile.removeFriend")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface-2 px-5 text-sm font-semibold text-text transition-colors hover:border-accent/60 hover:bg-surface-2/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <UserCheck size={17} aria-hidden="true" />
          Arkadaşsın
        </button>
        <button
          type="button"
          onClick={onStartChat}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-5 text-sm font-semibold text-text transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <MessageCircle size={17} aria-hidden="true" />
          {t("publicProfile.message")}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggleFriend}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-5 text-sm font-semibold text-text transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
    >
      <UserPlus size={17} aria-hidden="true" />
      {t("publicProfile.addFriend")}
    </button>
  );
}
