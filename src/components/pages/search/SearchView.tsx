import SearchHeader from "./SearchHeader";
import SearchResults from "./SearchResults";

export default function SearchView({ queryInput, loading, isDebouncing, inputRef, displayMovies, localMovies, isShowingTrending, resultsCount, labels, onInputChange, onClear, onSearch }) {
  return (
    <div className="flex min-h-full flex-col bg-zinc-950">
      <SearchHeader queryInput={queryInput} loading={loading} isDebouncing={isDebouncing} inputRef={inputRef} title={labels.title} placeholder={labels.placeholder} onInputChange={onInputChange} onClear={onClear} onSearch={onSearch} />
      <SearchResults displayMovies={displayMovies} localMovies={localMovies} loading={loading} queryInput={queryInput} isShowingTrending={isShowingTrending} resultsCount={resultsCount} trendingLabel={labels.trending} resultsLabel={labels.results} noResultsLabel={labels.noResults} tryDifferentLabel={labels.tryDifferent} watchedLabel={labels.watched} wishlistLabel={labels.wishlist} />
    </div>
  );
}
