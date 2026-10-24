import { LoaderCircle } from "lucide-react";

// ── Refresh cache presentation ──────────────────────────────────────────────
export default function RefreshCacheView({ status, logs, loading, onRefresh, t }) {
  return (
    <main className="min-h-dvh bg-bg px-4 pb-24 pt-8 text-text md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-sm font-semibold text-accent">Film verisi</p>
        <h1 className="mb-6 font-syne text-3xl font-bold text-text">{t("refreshCache.title")}</h1>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-accent px-5 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
          {loading ? t("refreshCache.processing") : t("refreshCache.refresh")}
        </button>

        <div className="mb-4 text-sm" role="status" aria-live="polite">
          <span className="text-muted">Durum: </span>
          <span className="font-semibold text-accent">{status}</span>
        </div>

        <div className="max-h-[60vh] min-h-[400px] overflow-y-auto rounded-[var(--radius-md)] border border-border bg-surface p-4">
          {logs.map((log, index) => (
            <div key={index} className="border-b border-border/60 pb-1.5 text-sm text-muted last:border-0">{log}</div>
          ))}
          {logs.length === 0 && <div className="text-sm text-muted">{t("refreshCache.waiting")}</div>}
        </div>
      </div>
    </main>
  );
}
