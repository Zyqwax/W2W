"use client";

import dayjs from "dayjs";
import { Globe2, Lock, Pencil, Share2 } from "lucide-react";
import Link from "next/link";
import { getLanguageConfig } from "@/lib/i18n";

function listTitle(list, t) {
  if (list.id === "wishlist") return t("home.wishlist");
  if (list.id === "watched") return t("home.watched");
  return list.name;
}

function createdDate(value, language) {
  if (!value) return null;
  const date = typeof value?.toDate === "function" ? value.toDate() : value;
  return dayjs(date).locale(getLanguageConfig(language).dayjs).format("D MMM YYYY");
}

export default function ListHeader({ list, count, language, t, onEdit }) {
  const isPrivate = list.visibility === "private";
  const title = listTitle(list, t);
  const date = createdDate(list.createdAt, language);
  const VisibilityIcon = isPrivate ? Lock : Globe2;

  const handleShare = async () => {
    const shareData = { title, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error?.name !== "AbortError") console.error("Share list error:", error);
      }
      return;
    }
    await navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <header className="mb-6">
      <Link
        href="/lists"
        className="mb-6 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path
            d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
        {t("common.back")}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-accent">{t("lists.title")}</p>
          <h1 className="truncate font-syne text-2xl font-bold text-text md:text-3xl">{title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-text">
              <strong>{count}</strong>
              <span className="text-muted">{t("common.film")}</span>
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                isPrivate ? "border-border bg-surface-2 text-muted" : "border-border-accent bg-accent/10 text-accent"
              }`}
            >
              <VisibilityIcon size={12} aria-hidden="true" />
              {isPrivate ? t("lists.private") : t("lists.public")}
            </span>
            {date && <span className="text-xs text-muted">{date}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-border px-3 text-sm text-muted transition-colors hover:border-border-strong hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Pencil size={14} aria-hidden="true" />
            {t("lists.rename")}
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label={t("profile.share")}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-border text-muted transition-colors hover:border-border-strong hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Share2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 border-b border-border" />
    </header>
  );
}
