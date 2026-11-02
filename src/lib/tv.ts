export const tvStatuses = [
  "watchlist",
  "watching",
  "completed",
  "on_hold",
  "dropped",
] as const;
export type TvStatus = (typeof tvStatuses)[number];
export const statusLabel = (status: string, tr: boolean) =>
  ({
    watchlist: tr ? "İzlenecek" : "Watchlist",
    watching: tr ? "İzleniyor" : "Watching",
    completed: tr ? "Tamamlandı" : "Completed",
    on_hold: tr ? "Beklemede" : "On hold",
    dropped: tr ? "Bırakıldı" : "Dropped",
  })[status] || status;
export interface TvEpisode {
  id: number;
  season_number: number;
  episode_number: number;
  name: string;
  air_date: string | null;
  runtime: number | null;
  overview: string;
  still_path: string | null;
}
export interface TvSeason {
  season_number: number;
  name: string;
  episode_count: number;
  episodes?: TvEpisode[];
}
export interface TvShow {
  "watch/providers"?: {
    results: Record<
      string,
      {
        link?: string;
        flatrate?: {
          provider_id: number;
          provider_name: string;
          logo_path: string;
        }[];
        rent?: {
          provider_id: number;
          provider_name: string;
          logo_path: string;
        }[];
        buy?: {
          provider_id: number;
          provider_name: string;
          logo_path: string;
        }[];
        free?: {
          provider_id: number;
          provider_name: string;
          logo_path: string;
        }[];
        ads?: {
          provider_id: number;
          provider_name: string;
          logo_path: string;
        }[];
      }
    >;
  };
  id: string | number;
  name: string;
  overview?: string;
  poster_path?: string;
  posterPath?: string;
  backdrop_path?: string;
  vote_average?: number;
  first_air_date?: string;
  number_of_seasons?: number;
  status?: string;
  genres?: { id: number; name: string }[];
  seasons?: TvSeason[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
  videos?: { results: { key: string; site: string; type: string }[] };
}
export interface EpisodeMark {
  seasonNumber: number;
  episodeNumber: number;
  watchedAt?: string | Date;
}
export interface TvLibraryItem {
  series: TvShow;
  state: { status: TvStatus };
  watchedCount?: number;
}
export interface TvProgress {
  total: number;
  watched: number;
  next: TvEpisode | null;
}
export function isAired(
  ep: Pick<TvEpisode, "air_date" | "episode_number">,
  today = new Date().toISOString().slice(0, 10),
) {
  return ep.episode_number > 0 && !!ep.air_date && ep.air_date <= today;
}
export function progressFor(
  episodes: TvEpisode[],
  marks: EpisodeMark[],
): TvProgress {
  const keys = new Set(
    marks.map((m) => `${m.seasonNumber}:${m.episodeNumber}`),
  );
  const aired = episodes
    .filter((e) => e.season_number > 0 && isAired(e))
    .sort(
      (a, b) =>
        a.season_number - b.season_number ||
        a.episode_number - b.episode_number,
    );
  return {
    total: aired.length,
    watched: aired.filter((e) =>
      keys.has(`${e.season_number}:${e.episode_number}`),
    ).length,
    next:
      aired.find((e) => !keys.has(`${e.season_number}:${e.episode_number}`)) ||
      null,
  };
}
export async function tvRequest<T>(
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/tv?${new URLSearchParams(params)}`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("TV request failed");
  return response.json();
}
