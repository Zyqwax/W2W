"use client";

import { useState } from "react";
import { db } from "@/lib/db-client";
import { collection, getDocs } from "@/lib/store-client";
import { DEFAULT_LANGUAGE, LANGUAGES, translate } from "@/lib/i18n";
import { fetchAndCacheMovie } from "@/lib/tmdb";
import RefreshCacheView from "@/components/pages/refresh-cache/RefreshCacheView";

// ── Controller ──────────────────────────────────────────────────────────────
export default function RefreshCachePage() {
  const [status, setStatus] = useState("Bekliyor...");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const t = (key: string, values?: Record<string, any>) => translate(DEFAULT_LANGUAGE, key, values);

  const addLog = (msg) => setLogs((prev) => [...prev, msg]);

  const handleRefresh = async () => {
    setLoading(true);
    setStatus(t("refreshCache.starting"));
    try {
      const moviesRef = collection(db, "movies");
      const snap = await getDocs(moviesRef);
      addLog(`Toplam ${snap.size} film bulundu.`);

      for (const movieDoc of snap.docs) {
        const id = movieDoc.id;
        addLog(t("refreshCache.fetching", { id }));
        try {
          const localizedMovies = await Promise.all(
            LANGUAGES.map((language) => fetchAndCacheMovie(id, language.tmdb, "TR", { forceRefresh: true })),
          );
          const title = localizedMovies.find(Boolean)?.title || id;
          addLog(t("refreshCache.success", { title }));
        } catch {
          addLog(t("refreshCache.failed", { id }));
        }
      }

      setStatus(t("refreshCache.completed"));
    } catch (err) {
      console.error(err);
      setStatus(`Hata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return <RefreshCacheView status={status} logs={logs} loading={loading} onRefresh={handleRefresh} t={t} />;
}
