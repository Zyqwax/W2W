import { Flame } from "lucide-react";
import MovieCard from "@/components/pages/home/MovieCard";

export default function TrendGrid({ movies, localMovies = [], title, emptyLabel, watchedLabel }) {
  return (
    <section className="px-4 py-6 md:px-0 md:py-8" aria-labelledby="trending-heading">
      <div className="mb-5 flex items-center gap-2">
        <Flame size={18} className="text-accent-alt" aria-hidden="true" />
        <h2 id="trending-heading" className="font-syne text-lg font-semibold text-text md:text-xl">{title}</h2>
      </div>
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 md:justify-items-start lg:grid-cols-5">
          {movies.map((movie) => {
            const localData = localMovies.find((item) => String(item.id) === String(movie.id));
            return <MovieCard key={movie.id} movie={{ ...movie, isWatched: localData?.isWatched, rating: localData?.rating || movie.vote_average }} watchedLabel={watchedLabel} />;
          })}
        </div>
      ) : <p className="py-12 text-center text-sm text-muted">{emptyLabel}</p>}
    </section>
  );
}
