import { SearchIcon, Flame } from "lucide-react";
import { MovieCard } from "@/components/ArchiveUI";

export default function SearchResults({ displayMovies, localMovies, loading, queryInput, isShowingTrending, resultsCount, trendingLabel, resultsLabel, noResultsLabel, tryDifferentLabel, watchedLabel, wishlistLabel }) {
  return (
    <div className="flex-1 px-3 pb-4 pt-4 md:px-6">
      {isShowingTrending && displayMovies.length > 0 && <div className="mb-4 flex items-center gap-2"><Flame size={16} className="text-rose-500" /><h2 className="text-sm font-bold text-zinc-300">{trendingLabel}</h2></div>}
      {!isShowingTrending && resultsCount > 0 && <div className="mb-4 flex items-center gap-2"><SearchIcon size={14} className="text-zinc-500" /><span className="text-sm text-zinc-400"><span className="font-bold text-white">{resultsCount}</span> {resultsLabel}</span></div>}
      {loading ? <div className="my-8 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-rose-500" /></div> : displayMovies.length === 0 && queryInput.trim() ? <div className="flex flex-col items-center justify-center py-20 text-zinc-500"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900"><SearchIcon className="h-6 w-6 opacity-40" /></div><p className="text-sm font-medium">{noResultsLabel}</p><p className="mt-1 text-xs text-zinc-600">{tryDifferentLabel}</p></div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">{displayMovies.map((movie, index) => { const localData = localMovies?.find((m) => m.id === String(movie.id)); return <div key={movie.id} className="animate-fade-in" style={{ animationDelay: `${index * 25}ms` }}><MovieCard movie={movie} rating={movie.vote_average} status={localData ? (localData.isWatched ? watchedLabel : wishlistLabel) : undefined} /></div>; })}</div>}
    </div>
  );
}
