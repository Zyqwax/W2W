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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/60 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white">{t("movie.recommend")}</h2>
            <p className="text-[10px] text-zinc-500 mt-0.5 truncate flex items-center gap-1">
              <Film size={9} className="text-rose-400 shrink-0" />
              {movieTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </div>

        {/* Friends List */}
        <div className="px-3 pb-2 max-h-[45vh] overflow-y-auto">
          {friends.length === 0 ? (
            <div className="py-10 text-center text-zinc-500">
              <p className="text-xs">{t("messages.needFriend")}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
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
                        ? "bg-rose-500/10 ring-1 ring-rose-500/30"
                        : "hover:bg-zinc-800/60"
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
                      className={`text-sm truncate flex-1 ${isSelected ? "text-white font-medium" : "text-zinc-300"}`}
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
              className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-500 transition disabled:opacity-30 flex items-center justify-center gap-2 active:scale-[0.98]"
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
