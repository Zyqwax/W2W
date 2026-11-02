import "server-only";
import type { TvEpisode, TvSeason, TvShow } from "./tv";
export async function tmdbTv<T>(path: string, language = "tr"): Promise<T> {
  const key = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) throw new Error("TMDB not configured");
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  url.searchParams.set("api_key", key);
  url.searchParams.set("language", language === "en" ? "en-US" : "tr-TR");
  const response = await fetch(url, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("TMDB unavailable");
  return response.json();
}
export async function airedCatalog(id: string, language: string) {
  const show = await tmdbTv<TvShow>(`/tv/${id}`, language);
  const seasons = (show.seasons || []).filter((s) => s.season_number > 0);
  const episodes: TvEpisode[] = [];
  // Bound upstream concurrency; season responses are shared with the detail endpoint cache.
  for (let i = 0; i < seasons.length; i += 4) {
    const rows = await Promise.all(
      seasons
        .slice(i, i + 4)
        .map((s) =>
          tmdbTv<TvSeason>(`/tv/${id}/season/${s.season_number}`, language),
        ),
    );
    episodes.push(...rows.flatMap((row) => row.episodes || []));
  }
  return episodes;
}
