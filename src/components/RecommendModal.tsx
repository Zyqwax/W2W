"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Send, Film } from "lucide-react";

/**
 * RecommendModal — Arkadaş seçme modalı
 * Film önerisi göndermek için arkadaş listesinden birini seçer.
 */
export default function RecommendModal({
  friends,
  movieTitle,
  onSelect,
  onClose,
  t,
}) {
  const [selectedUid, setSelectedUid] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!selectedUid) return;
    setSending(true);
    await onSelect(selectedUid);
    setSending(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-t-3xl border border-border bg-surface shadow-2xl animate-fade-in sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text">{t("movie.recommend")}</h2>
            <p className="mt-0.5 flex truncate items-center gap-1 text-xs text-muted">
              <Film size={12} className="shrink-0 text-accent-alt" />
              {movieTitle}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("common.cancel")}
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-muted transition hover:text-text"
          >
            <X size={14} />
          </button>
        </div>

        {/* Friends List */}
        <div className="px-3 pb-2 max-h-[45vh] overflow-y-auto">
          {friends.length === 0 ? (
            <div className="py-10 text-center text-muted">
              <p className="text-sm">{t("messages.needFriend")}</p>
              <p className="mt-1 text-xs text-faint">
                {t("profile.addFriend")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {friends.map((friend) => {
                const isSelected = selectedUid === (friend.uid || friend.id);
                return (
                  <button
                    key={friend.uid || friend.id}
                    onClick={() => setSelectedUid(friend.uid || friend.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full text-left ${
                      isSelected
                        ? "bg-accent/10 ring-1 ring-accent/30"
                        : "hover:bg-surface-2"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-rose-500 to-orange-500 flex items-center justify-center shrink-0 overflow-hidden">
                      {friend.photoURL ? (
                        <Image
                          src={friend.photoURL}
                          alt={friend.displayName || ""}
                          width={36}
                          height={36}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {friend.displayName?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>

                    <span
                      className={`flex-1 truncate text-sm ${isSelected ? "font-semibold text-accent" : "text-text"}`}
                    >
                      {friend.displayName || t("nav.user")}
                    </span>

                    {isSelected && (
                      <div className="w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center shrink-0">
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {friends.length > 0 && (
          <div className="px-4 pb-5 pt-1">
            <button
              onClick={handleSend}
              disabled={!selectedUid || sending}
              type="button"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
            >
              <Send size={14} />
              {sending ? t("common.saving") : t("movie.recommend")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
