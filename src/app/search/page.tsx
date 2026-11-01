"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { getLanguageConfig, translate } from "@/lib/i18n";
import SearchBar from "@/components/pages/search/SearchBar";
import SearchResultGrid from "@/components/pages/search/SearchResultGrid";
import PageLoading from "@/components/ui/PageLoading";
import { saveWishlistMovie } from "@/lib/user-lists";

const SEARCH_DEBOUNCE_MS = 800;
const GENRES = [
  { id: 28, tr: "Aksiyon", en: "Action" },
  { id: 35, tr: "Komedi", en: "Comedy" },
  { id: 18, tr: "Dram", en: "Drama" },
  { id: 27, tr: "Korku", en: "Horror" },
  { id: 878, tr: "Bilim kurgu", en: "Sci-fi" },
  { id: 10749, tr: "Romantik", en: "Romance" },
];
const BROWSE_YEARS = Array.from({ length: 7 }, (_, index) => new Date().getFullYear() - index);

// ── Page controller ─────────────────────────────────────────────────────────
export default function SearchPage() {
  const { user, loading: authLoading, language, region } = useAuth();
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);
  const searchCacheKey = `w2w_searchResults_${language}_${region}`;
  const trendingCacheKey = `w2w_trendingCache_${language}_${region}`;
  const { movies: localMovies } = useAppData();
  const router = useRouter();

  // ── Search state ──────────────────────────────────────────────────────────
  const [queryInput, setQueryInput] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("w2w_searchQuery") || sessionStorage.getItem("movieTracker_searchQuery") || "";
    return "";
  });
  const [results, setResults] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(searchCacheKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });
  const [trending, setTrending] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(trendingCacheKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });
  const [genreMovies, setGenreMovies] = useState([]);
  const [yearMovies, setYearMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [quickSaving, setQuickSaving] = useState(null);
  const [quickSaved, setQuickSaved] = useState(null);
  const [quickSaveError, setQuickSaveError] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // ── API effects ───────────────────────────────────────────────────────────
  const fetchTrending = useCallback(async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "demo_key";
      const { tmdb } = getLanguageConfig(language);
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&language=${encodeURIComponent(tmdb)}&region=${encodeURIComponent(region)}`,
      );
      if (res.ok) {
        const data = await res.json();
        const trendingData = data.results.slice(0, 12);
        setTrending(trendingData);
        if (typeof window !== "undefined")
          sessionStorage.setItem(trendingCacheKey, JSON.stringify(trendingData));
      }
    } catch (error) {
      console.error("Trending error:", error);
    }
  }, [language, region, trendingCacheKey]);

  useEffect(() => {
    if (!authLoading && user === null) {
      router.push("/login");
      return;
    }
    if (user) {
      const timeoutId = setTimeout(() => fetchTrending(), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [user, authLoading, router, fetchTrending]);

  const fetchResults = useCallback(
    async (q) => {
      setIsDebouncing(false);
      const searchQuery = q.trim();
      setSearchError(false);
      if (!searchQuery) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "demo_key";
        const { tmdb } = getLanguageConfig(language);
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&language=${encodeURIComponent(tmdb)}&region=${encodeURIComponent(region)}&page=1`,
        );
        if (!res.ok) throw new Error(`TMDB search failed (${res.status})`);
        const data = await res.json();
        const newResults = data.results || [];
        setResults(newResults);
        sessionStorage.setItem(searchCacheKey, JSON.stringify(newResults));
      } catch (error) {
        setSearchError(true);
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    },
    [language, region, searchCacheKey],
  );

  const fetchGenre = useCallback(async (genreId) => {
    setSelectedGenre(genreId);
    setSelectedYear(null);
    setSearchError(false);
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "demo_key";
      const { tmdb } = getLanguageConfig(language);
      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&language=${encodeURIComponent(tmdb)}&region=${encodeURIComponent(region)}&page=1`);
      if (!response.ok) throw new Error(`TMDB genre discovery failed (${response.status})`);
      setGenreMovies((await response.json()).results || []);
    } catch (error) {
      setSearchError(true);
      console.error("Genre discovery error:", error);
    } finally {
      setLoading(false);
    }
  }, [language, region]);

  const fetchYear = useCallback(async (year) => {
    setSelectedYear(year);
    setSelectedGenre(null);
    setSearchError(false);
    if (!year) return;
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "demo_key";
      const { tmdb } = getLanguageConfig(language);
      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&primary_release_year=${year}&sort_by=popularity.desc&language=${encodeURIComponent(tmdb)}&region=${encodeURIComponent(region)}&page=1`);
      if (!response.ok) throw new Error(`TMDB year discovery failed (${response.status})`);
      setYearMovies((await response.json()).results || []);
    } catch (error) {
      setSearchError(true);
      console.error("Year discovery error:", error);
    } finally {
      setLoading(false);
    }
  }, [language, region]);

  const addToWatchlist = async (movie) => {
    if (!user || !movie?.id) return;
    setQuickSaving(String(movie.id));
    setQuickSaveError(false);
    try {
      await saveWishlistMovie(user.uid, movie.id, {
        title: movie.title || movie.original_title,
        posterPath: movie.poster_path || null,
        status: "wishlist",
        addedAt: Date.now(),
      });
      setQuickSaved(String(movie.id));
      window.setTimeout(() => setQuickSaved((current) => current === String(movie.id) ? null : current), 2200);
    } catch (error) {
      setQuickSaveError(true);
      window.setTimeout(() => setQuickSaveError(false), 3000);
      console.error("Quick add to watchlist error:", error);
    } finally {
      setQuickSaving(null);
    }
  };

  // ── Interaction handlers ─────────────────────────────────────────────────
  const handleInputChange = useCallback((val) => {
    setQueryInput(val);
    setSelectedGenre(null);
    setSelectedYear(null);
    sessionStorage.setItem("w2w_searchQuery", val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setIsDebouncing(false);
      setResults([]);
      sessionStorage.setItem(searchCacheKey, JSON.stringify([]));
      return;
    }
    setIsDebouncing(true);
    debounceRef.current = setTimeout(() => fetchResults(val), SEARCH_DEBOUNCE_MS);
  }, [fetchResults, searchCacheKey]);
  const handleClear = () => {
    setQueryInput("");
    setSelectedGenre(null);
    setSelectedYear(null);
    setIsDebouncing(false);
    setResults([]);
    sessionStorage.setItem("w2w_searchQuery", "");
    sessionStorage.setItem(searchCacheKey, JSON.stringify([]));
    clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  };
  const handleSearch = (e) => {
    e?.preventDefault();
    setIsDebouncing(false);
    clearTimeout(debounceRef.current);
    fetchResults(queryInput);
  };

  useEffect(() => {
    const applyGlobalSearch = (event) => {
      const value = String(event.detail || "");
      setSelectedGenre(null);
      setSelectedYear(null);
      setQueryInput(value);
      fetchResults(value);
    };
    window.addEventListener("w2w-search-query", applyGlobalSearch);
    return () => window.removeEventListener("w2w-search-query", applyGlobalSearch);
  }, [fetchResults]);

  if (authLoading)
    return <PageLoading />;
  if (!user) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  const displayMovies = queryInput.trim() ? results : selectedGenre ? genreMovies : selectedYear ? yearMovies : trending;
  const labels = {
    title: t("search.title"),
    placeholder: t("search.placeholder"),
    trending: t("search.trending"),
    results: t("search.results"),
    noResults: t("search.noResults"),
    tryDifferent: t("search.tryDifferent"),
    watched: t("search.watched"),
    wishlist: t("search.wishlist"),
  };
  return (
    <div className="mx-auto min-h-full max-w-[1480px] bg-bg px-4 pb-10 text-text sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <header className="mb-7 pt-7">
          <p className="text-sm font-semibold text-accent">{language === "en" ? "Find your next favorite" : "Sıradaki favorini bul"}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{language === "en" ? "Explore films" : "Film keşfet"}</h1>
          <p className="mt-2 text-sm text-muted">{language === "en" ? "Search a title or browse by mood." : "Bir film ara ya da türler arasında gezin."}</p>
        </header>
        <SearchBar
          queryInput={queryInput}
          loading={loading}
          isDebouncing={isDebouncing}
          inputRef={inputRef}
          title={labels.title}
          placeholder={labels.placeholder}
          onInputChange={handleInputChange}
          onClear={handleClear}
          onSearch={handleSearch}
        />
        {!queryInput.trim() && <section className="mb-8" aria-label={language === "en" ? "Browse genres" : "Türe göre keşfet"}>
          <h2 className="mb-3 text-sm font-bold text-text">{language === "en" ? "Browse by genre" : "Türe göre keşfet"}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {GENRES.map((genre) => <button key={genre.id} type="button" aria-pressed={selectedGenre === genre.id} onClick={() => { setQueryInput(""); sessionStorage.setItem("w2w_searchQuery", ""); fetchGenre(genre.id); }} className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${selectedGenre === genre.id ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted hover:border-accent/40 hover:text-accent"}`}>{language === "en" ? genre.en : genre.tr}</button>)}
            </div>
            <label className="sr-only" htmlFor="discover-year">{language === "en" ? "Browse by year" : "Yıla göre keşfet"}</label>
            <select id="discover-year" value={selectedYear || ""} onChange={(event) => { setQueryInput(""); sessionStorage.setItem("w2w_searchQuery", ""); fetchYear(event.target.value); }} className="min-h-11 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20">
              <option value="">{language === "en" ? "Year" : "Yıl"}</option>
              {BROWSE_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
            {(selectedGenre || selectedYear) && <button type="button" onClick={() => { setSelectedGenre(null); setSelectedYear(null); }} className="min-h-10 px-3 text-sm font-semibold text-accent">{language === "en" ? "Clear" : "Temizle"}</button>}
          </div>
        </section>}
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-xl font-extrabold tracking-tight text-text">{queryInput.trim() ? labels.results : selectedGenre ? GENRES.find((genre) => genre.id === selectedGenre)?.[language === "en" ? "en" : "tr"] : selectedYear || labels.trending}</h2>
          {!loading && displayMovies.length > 0 && <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-muted">{displayMovies.length}</span>}
        </div>
        {searchError && <p role="alert" className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">{language === "en" ? "Search failed. Check your connection and try again." : "Arama yapılamadı. Bağlantını kontrol edip yeniden dene."}</p>}
        <SearchResultGrid
          movies={displayMovies}
          localMovies={localMovies}
          loading={loading}
          isDebouncing={isDebouncing}
          queryInput={queryInput || (selectedGenre ? "genre" : selectedYear ? "year" : "")}
          resultsCount={displayMovies.length}
          resultsLabel={labels.results}
          noResultsLabel={labels.noResults}
          tryDifferentLabel={labels.tryDifferent}
          watchedLabel={labels.watched}
          wishlistLabel={labels.wishlist}
          language={language}
          savingId={quickSaving}
          savedId={quickSaved}
          onAdd={addToWatchlist}
        />
        {(quickSaved || quickSaveError) && <p role={quickSaveError ? "alert" : "status"} className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl lg:bottom-6 ${quickSaveError ? "bg-danger" : "bg-[#20231f]"}`}>{quickSaveError ? (language === "en" ? "Could not add this film. Try again." : "Film listeye eklenemedi. Yeniden dene.") : (language === "en" ? "Added to your watchlist" : "İzleme listene eklendi")}</p>}
      </div>
    </div>
  );
}
