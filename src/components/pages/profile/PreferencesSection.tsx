import { Settings2 } from "lucide-react";
import { LANGUAGES, REGIONS, getRegionLabel } from "@/lib/i18n";

export default function PreferencesSection({ language, region, onChange, status, t }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-6" aria-labelledby="settings-title">
      <div className="mb-5 flex items-center gap-2">
        <Settings2 size={18} className="text-accent" aria-hidden="true" />
        <h2 id="settings-title" className="font-syne text-xl font-bold text-text">
          {t("settings.title")}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          {t("settings.language")}
          <select
            value={language}
            onChange={(event) => onChange("language", event.target.value)}
            className="min-h-11 rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 text-sm font-normal text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal text-muted">{t("settings.languageHelp")}</span>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          {t("settings.region")}
          <select
            value={region}
            onChange={(event) => onChange("region", event.target.value)}
            className="min-h-11 rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 text-sm font-normal text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            {REGIONS.map((item) => (
              <option key={item.code} value={item.code}>
                {getRegionLabel(item.code, language)}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal text-muted">{t("settings.regionHelp")}</span>
        </label>
      </div>

      {status !== "idle" && (
        <p
          className={`mt-4 text-sm ${status === "error" ? "text-danger" : status === "saving" ? "text-muted" : "text-success"}`}
          role="status"
        >
          {status === "saving" ? t("common.saving") : status === "saved" ? t("settings.saved") : t("settings.error")}
        </p>
      )}
    </section>
  );
}
