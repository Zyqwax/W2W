"use client";
/* Resource changes reset loading state before starting cancellable requests. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ListPlus, Play, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs } from "@/lib/store-client";
import { db } from "@/lib/db-client";
import CastRow from "@/components/pages/movie/CastRow";
import ProviderList from "@/components/pages/movie/ProviderList";
import { translate } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import SeriesHero from "@/components/tv/SeriesHero";
import SeriesProgress from "@/components/tv/SeriesProgress";
import SeasonAccordion from "@/components/tv/SeasonAccordion";
import {
  tvRequest,
  tvStatuses,
  statusLabel,
  isAired,
  type TvShow,
  type TvSeason,
  type TvEpisode,
  type EpisodeMark,
  type TvProgress,
} from "@/lib/tv";
type StateResponse = {
  state: { status: string } | null;
  episodes: EpisodeMark[];
  memberships: { listId: string }[];
};
export default function TvDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading, language, region } = useAuth();
  const router = useRouter();
  const tr = language === "tr";
  const [show, setShow] = useState<TvShow | null>(null);
  const [state, setState] = useState<StateResponse["state"]>(null);
  const [marks, setMarks] = useState<EpisodeMark[]>([]);
  const [memberships, setMemberships] = useState<{ listId: string }[]>([]);
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [retry, setRetry] = useState(0);
  const [pending, setPending] = useState(true);
  const [progress, setProgress] = useState<TvProgress | null>(null);
  const [progressError, setProgressError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);
  const [seasons, setSeasons] = useState<Record<number, TvSeason>>({});
  const [seasonLoading, setSeasonLoading] = useState<number | null>(null);
  const [seasonError, setSeasonError] = useState("");
  const seasonAbort = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    let active = true;
    setPending(true);
    setShow(null);
    setError("");
    setProgress(null);
    setSeasons({});
    setActiveSeason(null);
    seasonAbort.current?.abort();
    Promise.all([
      tvRequest<TvShow>({ action: "detail", id, language }, controller.signal),
      tvRequest<StateResponse>({ action: "state", id }, controller.signal),
    ])
      .then(([s, x]) => {
        if (!active) return;
        setShow(s);
        setState(x.state);
        setMarks(x.episodes);
        setMemberships(x.memberships);
      })
      .catch(() => {
        if (active)
          setError(tr ? "Dizi yüklenemedi." : "Could not load series.");
      })
      .finally(() => {
        if (active) setPending(false);
      });
    getDocs(collection(db, "users", user.uid, "lists"))
      .then((l) => {
        if (active)
          setLists(
            l.docs
              .map((d) => ({
                id: d.id,
                name: String(d.data().name || ""),
                type: d.data().type,
              }))
              .filter((d) => d.type === "custom"),
          );
      })
      .catch(() => {
        if (active)
          setError(
            tr ? "Özel listeler yüklenemedi." : "Could not load custom lists.",
          );
      });
    return () => {
      active = false;
      controller.abort();
      seasonAbort.current?.abort();
    };
  }, [user, id, language, tr, retry]);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setProgressError(false);
    tvRequest<TvProgress>(
      { action: "progress", id, language },
      controller.signal,
    )
      .then(setProgress)
      .catch(() => {
        if (!controller.signal.aborted) setProgressError(true);
      });
    return () => controller.abort();
  }, [user, id, language, revision, retry]);
  const loadSeason = useCallback(
    async (n: number) => {
      seasonAbort.current?.abort();
      setActiveSeason(n);
      setSeasonError("");
      if (seasons[n]) {
        setSeasonLoading(null);
        return;
      }
      const controller = new AbortController();
      seasonAbort.current = controller;
      setSeasonLoading(n);
      try {
        const row = await tvRequest<TvSeason>(
          { action: "season", id, season: String(n), language },
          controller.signal,
        );
        setSeasons((old) => ({ ...old, [n]: row }));
      } catch {
        if (!controller.signal.aborted)
          setSeasonError(tr ? "Sezon yüklenemedi." : "Could not load season.");
      } finally {
        if (!controller.signal.aborted) setSeasonLoading(null);
      }
    },
    [id, language, seasons, tr],
  );
  async function post(data: Record<string, unknown>, apply: () => void) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/tv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!r.ok) throw Error();
      apply();
      setProgress(null);
      setRevision((v) => v + 1);
    } catch {
      setError(
        tr
          ? "İşlem kaydedilemedi. Yeniden dene."
          : "Could not save. Try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function toggle(ep: TvEpisode) {
    const watched = !marks.some(
      (m) =>
        m.seasonNumber === ep.season_number &&
        m.episodeNumber === ep.episode_number,
    );
    post(
      {
        action: "episode",
        season: ep.season_number,
        episode: ep.episode_number,
        watched,
      },
      () =>
        setMarks((old) =>
          watched
            ? [
                ...old,
                {
                  seasonNumber: ep.season_number,
                  episodeNumber: ep.episode_number,
                },
              ]
            : old.filter(
                (m) =>
                  m.seasonNumber !== ep.season_number ||
                  m.episodeNumber !== ep.episode_number,
              ),
        ),
    );
  }
  function bulk(n: number, watched: boolean) {
    const numbers = (seasons[n]?.episodes || [])
      .filter((e) => !watched || isAired(e))
      .map((e) => e.episode_number);
    post(
      { action: "season", season: n, episodeNumbers: numbers, watched },
      () =>
        setMarks((old) => [
          ...old.filter(
            (m) => m.seasonNumber !== n || !numbers.includes(m.episodeNumber),
          ),
          ...(watched
            ? numbers.map((e) => ({ seasonNumber: n, episodeNumber: e }))
            : []),
        ]),
    );
  }
  if (!user) return null;
  if (pending)
    return (
      <div className="mx-auto max-w-[1320px] space-y-6 p-6" aria-busy="true">
        <Skeleton height="24rem" className="rounded-3xl" />
        <Skeleton height="12rem" className="rounded-2xl" />
      </div>
    );
  if (!show)
    return (
      <div role="alert" className="p-8">
        <p className="mb-4 text-danger">{error}</p>
        <Button onClick={() => setRetry((x) => x + 1)}>
          {tr ? "Yeniden dene" : "Retry"}
        </Button>
      </div>
    );
  const trailer = show.videos?.results.find(
    (v) =>
      v.site === "YouTube" && v.type === "Trailer" && /^[\w-]+$/.test(v.key),
  );
  const regionProviders = show["watch/providers"]?.results?.[region || "TR"];
  const providers = regionProviders
    ? Object.fromEntries(
        Object.entries(regionProviders).map(([key, value]) => [
          key,
          Array.isArray(value)
            ? value.map((p) => ({
                id: p.provider_id,
                name: p.provider_name,
                logoPath: p.logo_path,
              }))
            : value,
        ]),
      )
    : null;
  const t = (key: string) => translate(language, key);
  return (
    <main className="mx-auto max-w-[1320px] space-y-6 px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
      <SeriesHero show={show} tr={tr} />
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
        >
          {error}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-lg font-bold">
              {tr ? "Kütüphanem" : "My library"}
            </h2>
            <label
              htmlFor="tv-status"
              className="mb-2 block text-xs text-muted"
            >
              {tr ? "Takip durumu" : "Tracking status"}
            </label>
            <select
              id="tv-status"
              disabled={busy}
              value={state?.status || ""}
              onChange={(e) => {
                const status = e.target.value;
                post(
                  {
                    action: "status",
                    status,
                    name: show.name,
                    posterPath: show.poster_path,
                  },
                  () => setState({ status }),
                );
              }}
              className="min-h-12 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm"
            >
              <option value="" disabled>
                {tr ? "Takibe ekle" : "Add to library"}
              </option>
              {tvStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s, tr)}
                </option>
              ))}
            </select>
            {state && (
              <Button
                className="mt-3 w-full text-danger"
                variant="ghost"
                disabled={busy}
                onClick={() => setConfirmRemove(true)}
              >
                <Trash2 size={15} />
                {tr ? "Takipten çıkar" : "Remove from library"}
              </Button>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                {tr ? "İzleme ilerlemen" : "Your progress"}
              </h2>
              <span className="text-xs text-muted">
                {marks.length} {tr ? "bölüm işaretlendi" : "episodes marked"}
              </span>
            </div>
            {progress ? (
              <SeriesProgress progress={progress} tr={tr} />
            ) : (
              <p className="text-sm text-muted">
                {tr ? "İlerleme hesaplanıyor…" : "Calculating progress…"}
              </p>
            )}
            {progressError && (
              <div
                role="alert"
                className="mt-3 flex items-center gap-3 text-xs text-warning"
              >
                {tr ? "İlerleme yenilenemedi." : "Could not refresh progress."}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRevision((v) => v + 1)}
                >
                  {tr ? "Yenile" : "Retry"}
                </Button>
              </div>
            )}
            {state && progress?.next && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-accent/10 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">
                    {tr ? "Sıradaki bölüm" : "Up next"}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    S{progress.next.season_number} ·{" "}
                    {progress.next.episode_number}. {progress.next.name}
                  </p>
                </div>
                <Button loading={busy} onClick={() => toggle(progress.next)}>
                  <Play size={15} />
                  {tr ? "İzlendi işaretle" : "Mark watched"}
                </Button>
              </div>
            )}
            {!state && (
              <p className="mt-4 text-sm text-muted">
                {tr
                  ? "Bölümleri işaretlemek için bir takip durumu seç."
                  : "Choose a tracking status to mark episodes."}
              </p>
            )}
          </section>
          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="mb-3 text-xl font-bold">
              {tr ? "Hikâye" : "Overview"}
            </h2>
            <p className="text-sm leading-7 text-muted">
              {show.overview ||
                (tr ? "Henüz özet bulunmuyor." : "No overview available.")}
            </p>
            {trailer && (
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent"
              >
                <Play size={16} />
                {tr ? "Fragmanı izle" : "Watch trailer"}
              </a>
            )}
          </section>
          {show.credits?.cast?.length > 0 && (
            <CastRow
              cast={show.credits.cast
                .slice(0, 8)
                .map((a) => ({ ...a, profilePath: a.profile_path }))}
              t={t}
            />
          )}
          <section>
            <h2 className="mb-4 text-2xl font-bold">
              {tr ? "Sezonlar ve bölümler" : "Seasons & episodes"}
            </h2>
            <div className="space-y-3">
              {show.seasons?.map((s) => (
                <SeasonAccordion
                  key={s.season_number}
                  summary={s}
                  data={seasons[s.season_number]}
                  open={activeSeason === s.season_number}
                  loading={seasonLoading === s.season_number}
                  error={activeSeason === s.season_number ? seasonError : ""}
                  marks={marks}
                  busy={busy}
                  tracked={!!state}
                  tr={tr}
                  onOpen={() => {
                    if (activeSeason === s.season_number && !seasonError) {
                      seasonAbort.current?.abort();
                      setActiveSeason(null);
                    } else loadSeason(s.season_number);
                  }}
                  onToggle={toggle}
                  onBulk={(w) => bulk(s.season_number, w)}
                />
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <ProviderList
              providers={providers}
              loading={false}
              error={false}
              regionLabel={region || "TR"}
              t={t}
            />
          </div>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <ListPlus size={18} className="text-accent" />
              {tr ? "Özel listeler" : "Custom lists"}
            </h2>
            {lists.length ? (
              <div className="space-y-2">
                {lists.map((l) => {
                  const selected = memberships.some((m) => m.listId === l.id);
                  return (
                    <Button
                      key={l.id}
                      className="w-full justify-start"
                      variant="ghost"
                      disabled={busy}
                      aria-pressed={selected}
                      onClick={() =>
                        post(
                          {
                            action: "list",
                            listId: l.id,
                            add: !selected,
                            name: show.name,
                            posterPath: show.poster_path,
                          },
                          () =>
                            setMemberships((old) =>
                              selected
                                ? old.filter((m) => m.listId !== l.id)
                                : [...old, { listId: l.id }],
                            ),
                        )
                      }
                    >
                      {selected ? "✓" : "+"} {l.name}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <Link href="/lists" className="text-sm text-accent underline">
                {tr ? "Yeni liste oluştur" : "Create a list"}
              </Link>
            )}
          </section>
        </aside>
      </div>
      <p className="text-xs text-muted">
        {tr ? "Dizi bilgileri" : "Series data"}:{" "}
        <a href="https://www.themoviedb.org/" className="underline">
          TMDB
        </a>
      </p>
      <Modal
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title={tr ? "Diziyi takipten çıkar" : "Remove series"}
      >
        <p className="mb-5 text-sm text-muted">
          {tr
            ? "Bu dizinin bölüm işaretleri de silinecek. Özel listelerdeki üyelikleri korunur."
            : "Episode marks will also be deleted. Custom list memberships are kept."}
        </p>
        <div className="flex gap-2">
          <Button
            variant="danger"
            loading={busy}
            onClick={() =>
              post({ action: "remove" }, () => {
                setState(null);
                setMarks([]);
                setConfirmRemove(false);
              })
            }
          >
            {tr ? "Takipten çıkar" : "Remove"}
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => setConfirmRemove(false)}
          >
            {tr ? "Vazgeç" : "Cancel"}
          </Button>
        </div>
      </Modal>
    </main>
  );
}
