import { doc, getDoc, setDoc, serverTimestamp } from "@/lib/store-client";
import { db } from "@/lib/db-client";
import type { Movie, ProvidersData } from "@/types";

function movieRef(id: string | number) {
  return doc(db, "movies", String(id));
}

function localizationRef(id: string | number, language: string) {
  return doc(db, "movies", String(id), "localizations", language);
}

function providerRef(id: string | number, region: string) {
  return doc(db, "movies", String(id), "providers", region);
}

function normalizeMovie(data: any) {
  return {
    id: data.id,
    originalTitle: data.original_title || null,
    originalLanguage: data.original_language || null,
    posterPath: data.poster_path || null,
    backdropPath: data.backdrop_path || null,
    releaseDate: data.release_date || null,
    runtime: data.runtime ?? null,
    voteAverage: data.vote_average ? Math.round(data.vote_average * 10) / 10 : null,
    voteCount: data.vote_count || 0,
  };
}

function normalizeLocalization(data: any, language: string) {
  return {
    locale: language,
    title: data.title || data.original_title || "",
    overview: data.overview || "",
    tagline: data.tagline || "",
    genres: data.genres?.map((genre: any) => genre.name) || [],
    trailer: data.videos?.results?.find((video: any) => video.type === "Trailer" && video.site === "YouTube")?.key || null,
    cast:
      data.credits?.cast
        ?.slice(0, 5)
        .map((castMember: any) => ({
          name: castMember.name,
          character: castMember.character,
          profilePath: castMember.profile_path,
        })) || [],
  };
}

function legacyMovie(data: any, language: string, region: string): Movie | null {
  return data
    ? { ...data, contentLanguage: data.contentLanguage || language, contentRegion: data.contentRegion || region }
    : null;
}

export async function fetchAndCacheMovie(
  id: string | number,
  language: string = "tr-TR",
  region: string = "TR",
  options: { forceRefresh?: boolean } = {}
): Promise<Movie | null> {
  const idString = String(id);
  const canonicalRef = movieRef(idString);
  const localizationDocRef = localizationRef(idString, language);

  try {
    const [canonicalSnap, localizationSnap] = await Promise.all([
      getDoc(canonicalRef),
      getDoc(localizationDocRef),
    ]);

    if (!options.forceRefresh && canonicalSnap.exists() && localizationSnap.exists()) {
      return {
        ...canonicalSnap.data(),
        ...localizationSnap.data(),
        id: canonicalSnap.data().id || Number(idString),
      };
    }

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${idString}?api_key=${apiKey}&language=${encodeURIComponent(language)}&region=${encodeURIComponent(region)}&append_to_response=videos,credits`,
    );
    if (!response.ok) throw new Error("Failed to fetch movie from TMDB");

    const data = await response.json();
    const movieData = normalizeMovie(data);
    const localizedData = normalizeLocalization(data, language);

    await Promise.all([
      setDoc(canonicalRef, { ...movieData, schemaVersion: 2, updatedAt: serverTimestamp() }, { merge: true }),
      setDoc(localizationDocRef, { ...localizedData, updatedAt: serverTimestamp() }, { merge: true }),
    ]);

    return { ...movieData, ...localizedData };
  } catch (error) {
    console.error("fetchAndCacheMovie error:", error);
    const legacySnap = await getDoc(canonicalRef).catch(() => null);
    return legacyMovie(legacySnap?.exists() ? legacySnap.data() : null, language, region);
  }
}

export async function fetchAndCacheMovies(
  ids: Array<string | number>,
  language: string = "tr-TR",
  region: string = "TR",
): Promise<Map<string, Movie>> {
  const uniqueIds = [...new Set(ids.map(String))];
  if (!uniqueIds.length) return new Map();
  try {
    const response = await fetch("/api/data/movies/batch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: uniqueIds, locale: language }),
    });
    if (!response.ok) throw new Error("Failed to load cached movie batch");
    const rows = await response.json();
    const result = new Map<string, Movie>(rows
      .filter((movie: Movie & { hasLocalization?: boolean }) => movie.hasLocalization)
      .map((movie: Movie) => [String(movie.id), movie]));
    const missingIds = uniqueIds.filter((id) => !result.has(id));
    const fetched = await Promise.all(missingIds.map((id) => fetchAndCacheMovie(id, language, region)));
    fetched.forEach((movie, index) => { if (movie) result.set(missingIds[index], movie); });
    return result;
  } catch (error) {
    console.error("fetchAndCacheMovies error:", error);
    const movies = await Promise.all(uniqueIds.map((id) => fetchAndCacheMovie(id, language, region)));
    return new Map(movies.filter((movie): movie is Movie => Boolean(movie)).map((movie) => [String(movie.id), movie]));
  }
}

const providerTypes = ["flatrate", "free", "ads", "rent", "buy"] as const;

function normalizeProviders(data: any, region: string): ProvidersData | null {
  const regionData = data?.results?.[region];
  if (!regionData) return null;

  const providers: Record<string, any[]> = {};
  for (const type of providerTypes) {
    providers[type] = (regionData[type] || []).map((provider: any) => ({
      id: provider.provider_id,
      name: provider.provider_name,
      logoPath: provider.logo_path || null,
      priority: provider.display_priority ?? null,
    }));
  }

  return {
    region,
    link: typeof regionData.link === "string" ? regionData.link : null,
    ...providers,
  };
}

export async function fetchWatchProviders(id: string | number, region: string = "TR"): Promise<ProvidersData | null> {
  const cachedRef = providerRef(id, region);

  try {
    const cachedSnap = await getDoc(cachedRef);
    if (cachedSnap.exists()) return cachedSnap.data() as ProvidersData;

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${apiKey}`
    );
    if (!response.ok) throw new Error("Failed to fetch watch providers from TMDB");

    const providers = normalizeProviders(await response.json(), region);
    if (providers) {
      await setDoc(cachedRef, { ...providers, updatedAt: serverTimestamp() }, { merge: true });
    }
    return providers;
  } catch (error) {
    console.error("fetchWatchProviders error:", error);
    return null;
  }
}
