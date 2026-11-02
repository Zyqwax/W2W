"use client";
/* Resource changes reset loading state before starting cancellable requests. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Tv, Play } from "lucide-react";
import ContinueWatching from "@/components/tv/ContinueWatching";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import SeriesCard from "@/components/tv/SeriesCard";
import {
  statusLabel,
  tvStatuses,
  tvRequest,
  type TvLibraryItem,
  type TvShow,
} from "@/lib/tv";
export default function TvPage() {
  const { user, loading, language } = useAuth();
  const tr = language === "tr";
  const router = useRouter();
  const [library, setLibrary] = useState<TvLibraryItem[]>([]);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TvShow[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [filter, setFilter] = useState("all");
  const searchAbort = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setPending(true);
    setError("");
    tvRequest<TvLibraryItem[]>({ action: "library" }, controller.signal)
      .then(setLibrary)
      .catch(() => {
        if (!controller.signal.aborted)
          setError(tr ? "Diziler yüklenemedi." : "Could not load series.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setPending(false);
      });
    return () => controller.abort();
  }, [user, tr, retry]);
  useEffect(() => () => searchAbort.current?.abort(), []);
  async function search(e: React.FormEvent) {
    e.preventDefault();
    searchAbort.current?.abort();
    if (!query.trim()) {
      setResults(null);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    searchAbort.current = controller;
    setSearching(true);
    setSearchError("");
    try {
      const data = await tvRequest<{ results: TvShow[] }>(
        { action: "search", q: query.trim(), language },
        controller.signal,
      );
      setResults(data.results);
    } catch {
      if (!controller.signal.aborted)
        setSearchError(
          tr ? "Arama başarısız. Yeniden dene." : "Search failed. Try again.",
        );
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }
  const watching = library.filter((x) => x.state.status === "watching");
  const visible = library.filter(
    (x) => filter === "all" || x.state.status === filter,
  );
  if (!user) return null;
  const grid = (items: TvLibraryItem[]) => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-5">
      {items.map((x) => (
        <SeriesCard
          key={x.series.id}
          show={x.series}
          status={x.state.status}
          watchedCount={x.watchedCount}
          tr={tr}
        />
      ))}
    </div>
  );
  return (
    <main className="mx-auto max-w-[1320px] space-y-9 px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
      <header className="archive-hero-background rounded-3xl border border-border p-6 sm:p-9">
        <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-accent">
          W2W ·{" "}
          {tr
            ? "Bölüm bölüm, senin ritminde"
            : "Episode by episode, at your pace"}
        </p>
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          {tr ? "Dizi dünyan" : "Your series world"}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          {tr
            ? "Kaldığın yerden devam et, yeni hikâyeler keşfet ve izlediğin bölümleri takip et."
            : "Pick up where you left off, discover new stories and track every episode."}
        </p>
        <form
          onSubmit={search}
          role="search"
          className="mt-7 flex max-w-2xl gap-2"
        >
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-bg/70 px-4">
            <Search size={19} className="shrink-0 text-muted" />
            <input
              aria-label={tr ? "Dizi ara" : "Search series"}
              type="search"
              maxLength={200}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tr
                  ? "Bir sonraki favori dizini bul…"
                  : "Find your next favourite series…"
              }
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <Button type="submit" loading={searching}>
            {tr ? "Ara" : "Search"}
          </Button>
        </form>
      </header>
      {searchError && (
        <p role="alert" className="text-danger">
          {searchError}
        </p>
      )}
      {results !== null && (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {tr ? "Arama sonuçları" : "Search results"}
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                setResults(null);
                setQuery("");
              }}
            >
              {tr ? "Kapat" : "Close"}
            </Button>
          </div>
          {!results.length ? (
            <p
              role="status"
              className="rounded-2xl border border-border p-8 text-muted"
            >
              {tr
                ? "Dizi bulunamadı. Başka bir isimle ara."
                : "No series found. Try another name."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-5">
              {results.map((show) => (
                <SeriesCard key={show.id} show={show} tr={tr} />
              ))}
            </div>
          )}
        </section>
      )}
      {!pending && watching.length > 0 && (
        <section>
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
            <Play size={20} className="text-accent" />
            {tr ? "İzlemeye devam et" : "Continue watching"}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-3">
            {watching.slice(0, 8).map((x) => (
              <ContinueWatching
                key={x.series.id}
                item={x}
                language={language}
              />
            ))}
          </div>
        </section>
      )}
      <section>
        <div className="mb-5 flex items-center gap-2">
          <Tv size={21} className="text-accent" />
          <h2 className="text-2xl font-bold">
            {tr ? "Kütüphanem" : "My library"}
          </h2>
          <span className="text-sm text-muted">{library.length}</span>
        </div>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {["all", ...tvStatuses].map((s) => (
            <button
              key={s}
              aria-pressed={s === filter}
              onClick={() => setFilter(s)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm transition ${s === filter ? "border-accent bg-accent text-bg" : "border-border text-muted hover:text-text"}`}
            >
              {s === "all" ? (tr ? "Tümü" : "All") : statusLabel(s, tr)}
            </button>
          ))}
        </div>
        {pending ? (
          <div
            aria-busy="true"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="16rem" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-danger/30 p-6">
            <p className="mb-3 text-danger">{error}</p>
            <Button variant="ghost" onClick={() => setRetry((x) => x + 1)}>
              {tr ? "Yeniden dene" : "Retry"}
            </Button>
          </div>
        ) : visible.length ? (
          grid(visible)
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <Tv size={36} className="mx-auto mb-4 text-accent" />
            <h3 className="text-xl font-bold">
              {tr ? "Yeni bir hikâyeye yer var" : "Room for a new story"}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {tr
                ? "Bu görünümde dizi yok. Yukarıdan ara veya başka bir filtre seç."
                : "No series in this view. Search above or choose another filter."}
            </p>
          </div>
        )}
      </section>
      <p className="text-xs text-muted">
        {tr ? "Dizi bilgileri" : "Series data"}:{" "}
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          TMDB
        </a>
      </p>
    </main>
  );
}
