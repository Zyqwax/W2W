"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import SeriesProgress from "./SeriesProgress";
import { tvRequest, type TvLibraryItem, type TvProgress } from "@/lib/tv";
export default function ContinueWatching({
  item,
  language,
}: {
  item: TvLibraryItem;
  language: string;
}) {
  const [progress, setProgress] = useState<TvProgress | null>(null);
  const tr = language === "tr";
  useEffect(() => {
    const controller = new AbortController();
    tvRequest<TvProgress>(
      { action: "progress", id: String(item.series.id), language },
      controller.signal,
    )
      .then(setProgress)
      .catch(() => {});
    return () => controller.abort();
  }, [item.series.id, language]);
  return (
    <Link
      href={`/tv/${item.series.id}`}
      className="block w-80 shrink-0 rounded-2xl border border-border bg-surface p-5 transition hover:border-accent"
    >
      <div className="mb-4 flex items-center gap-3">
        <Play size={20} className="text-accent" />
        <h3 className="min-w-0 flex-1 truncate text-sm font-bold">
          {item.series.name}
        </h3>
        <ArrowRight size={16} />
      </div>
      {progress ? (
        <>
          <SeriesProgress progress={progress} tr={tr} />
          <p className="mt-3 truncate text-xs text-muted">
            {progress.next
              ? `S${progress.next.season_number} · ${progress.next.episode_number}. ${progress.next.name}`
              : tr
                ? "Yayınlanan bölümler tamamlandı"
                : "All aired episodes watched"}
          </p>
        </>
      ) : (
        <p className="text-xs text-muted">
          {item.watchedCount || 0}{" "}
          {tr ? "bölüm izlendi · Devam et" : "episodes watched · Continue"}
        </p>
      )}
    </Link>
  );
}
