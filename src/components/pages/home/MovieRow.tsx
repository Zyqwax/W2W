"use client";

import HorizontalMovieRail from "@/components/HorizontalMovieRail";
import MovieCard from "./MovieCard";

export default function MovieRow({ movies = [], loading = false, watchedLabel, emptyLabel = "Henüz film yok." }) {
  const items = loading ? Array.from({ length: 5 }, (_, index) => ({ id: `skeleton-${index}` })) : movies;

  if (!loading && !movies.length) {
    return <p className="py-5 text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <HorizontalMovieRail className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:gap-4">
      {items.map((movie) => <MovieCard key={movie.id} movie={movie} loading={loading} watchedLabel={watchedLabel} />)}
    </HorizontalMovieRail>
  );
}
