import Image from "next/image";
import HorizontalMovieRail from "@/components/HorizontalMovieRail";

export function MovieOverview({ overview, t }) {
  return <div className="mb-8"><h3 className="text-lg font-semibold text-white mb-2">{t("movie.overview")}</h3><p className="text-sm text-zinc-400 leading-relaxed">{overview || t("movie.missingOverview")}</p></div>;
}

export function MovieCast({ cast, t }) {
  if (!cast?.length) return null;
  return <div className="mb-8"><h3 className="text-lg font-semibold text-white mb-3">{t("movie.cast")}</h3><HorizontalMovieRail className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">{cast.map((actor) => <div key={actor.name} className="flex flex-col items-center shrink-0 w-20"><div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden mb-2 relative">{actor.profilePath && <Image src={`https://image.tmdb.org/t/p/w185${actor.profilePath}`} alt={actor.name} fill className="object-cover" unoptimized />}</div><span className="text-xs text-zinc-300 text-center line-clamp-1">{actor.name}</span><span className="text-[10px] text-zinc-500 text-center line-clamp-1">{actor.character}</span></div>)}</HorizontalMovieRail></div>;
}

export function MovieTrailer({ trailer, t }) {
  if (!trailer) return null;
  return <div className="mb-8"><h3 className="text-lg font-semibold text-white mb-3">{t("movie.trailer")}</h3><div className="aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800"><iframe src={`https://www.youtube.com/embed/${trailer}`} title="Trailer" className="w-full h-full" allowFullScreen></iframe></div></div>;
}
