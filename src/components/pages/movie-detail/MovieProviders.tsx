import Image from "next/image";
import { Forward } from "lucide-react";

export default function MovieProviders({ providers, loading, error, regionLabel, t }) {
  const types = ["flatrate", "free", "ads", "rent", "buy"];
  return <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
    <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-white">{t("movie.watchWhere")}</h3><span className="text-xs text-zinc-500">{regionLabel}</span></div>
    {loading ? <div className="flex items-center gap-2 text-sm text-zinc-500" role="status"><span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-rose-500" />{t("common.loading")}</div> : error ? <p className="text-sm text-rose-400">{t("movie.providersError")}</p> : providers && types.some((type) => providers[type]?.length) ? <div className="space-y-3">
      {types.map((type) => providers[type]?.length > 0 && <div key={type}><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t(`movie.${type === "flatrate" ? "subscription" : type}`)}</p><div className="flex flex-wrap gap-2">{providers[type].map((provider) => <a key={`${type}-${provider.id}`} href={providers.link || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-300 transition hover:border-rose-500/60 hover:text-white">{provider.logoPath ? <Image src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`} alt="" width={28} height={28} className="rounded-md" unoptimized /> : <span className="h-7 w-7 rounded-md bg-zinc-800" />}<span>{provider.name}</span></a>)}</div></div>)}
      {providers.link && <a href={providers.link} target="_blank" rel="noopener noreferrer" className="inline-flex text-xs font-semibold text-rose-400 hover:text-rose-300">{t("movie.justWatch")} <Forward size={12} className="ml-1" /></a>}
    </div> : <p className="text-sm text-zinc-500">{t("movie.noProviders")}</p>}
  </div>;
}
