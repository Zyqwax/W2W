import Image from "next/image";
import { ChevronDown, Link2 } from "lucide-react";

const providerGroups = [
  ["flatrate", "subscription"],
  ["rent", "rent"],
  ["buy", "buy"],
  ["free", "free"],
  ["ads", "ads"],
];

function ProviderPill({ provider, href }) {
  const content = (
    <>
      {provider.logoPath ? (
        <Image src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`} alt="" width={20} height={20} className="rounded-sm object-cover" unoptimized />
      ) : <span className="flex h-5 w-5 items-center justify-center rounded-sm text-[10px] text-muted">{provider.name?.charAt(0)}</span>}
      <span className="truncate">{provider.name}</span>
    </>
  );
  const className = "inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-[var(--radius-full)] border border-[--color-border] px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a> : <span className={className}>{content}</span>;
}

export default function ProviderList({ providers, loading, error, regionLabel, t }) {
  const hasProviders = providers && providerGroups.some(([type]) => providers[type]?.length);

  return (
    <section className="border-t border-[--color-border] py-5" aria-labelledby="movie-providers-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="movie-providers-heading" className="font-syne text-base font-semibold text-text">{t("movie.watchWhere")}</h2>
        <span className="inline-flex items-center gap-1 text-xs text-muted">{regionLabel}<ChevronDown size={13} aria-hidden="true" /></span>
      </div>

      {loading && <div className="mt-4 flex items-center gap-2 text-sm text-muted" role="status"><span className="h-4 w-4 animate-spin rounded-full border-2 border-[--color-border] border-t-accent" />{t("common.loading")}</div>}
      {!loading && error && <p className="mt-4 text-sm text-danger">{t("movie.providersError")}</p>}
      {!loading && !error && !hasProviders && <p className="mt-4 text-sm italic text-muted">{t("movie.noProviders")}</p>}
      {!loading && !error && hasProviders && (
        <div className="space-y-3">
          {providerGroups.map(([type, labelKey]) => providers[type]?.length > 0 && (
            <div key={type} className="mt-3 flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-muted">{t(`movie.${labelKey}`)}</span>
              <div className="flex min-w-0 flex-wrap gap-2">
                {providers[type].map((provider) => <ProviderPill key={`${type}-${provider.id}`} provider={provider} href={providers.link} />)}
              </div>
            </div>
          ))}
          {providers.link && <a href={providers.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs text-[--color-text-faint] transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><span>{t("movie.justWatch")}</span><Link2 size={13} aria-hidden="true" /></a>}
        </div>
      )}
    </section>
  );
}
