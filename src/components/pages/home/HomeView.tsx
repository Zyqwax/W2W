import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import HomeHero from "./HomeHero";
import HomeListShowcase from "./HomeListShowcase";

export default function HomeView({
  hero,
  t,
  wishlist,
  watched,
  activeTab,
  listed,
  options,
  sortKey,
  sortOpen,
  sortRef,
  dayjsLocale,
  onShuffle,
  onTabChange,
  onSortToggle,
  onSortChange,
  lists,
  listMovies,
  watchedMovieIds,
}) {
  const currentSortLabel = options.find((opt) => opt.value === sortKey)?.label || "Sırala";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      {/* Dynamic Hero Header */}
      <HomeHero hero={hero} t={t} wishlist={wishlist} watched={watched} onShuffle={onShuffle} />

      {/* Toolbar & Filter Bar */}
      <div className="mt-10 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold">
            {t("home.wishlist") || "İzleme Listem"}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white/70">
            {wishlist.length}
          </span>
        </div>

        {/* Custom Glassmorphism Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={onSortToggle}
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface1/80 px-4 py-2 text-xs font-semibold text-white/80 shadow-sm backdrop-blur-md transition-all hover:border-gold/40 hover:bg-surface2 hover:text-white"
          >
            <ArrowUpDown size={14} className="text-gold" />
            <span>{currentSortLabel}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
          </button>

          {sortOpen && (
            <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-surface2/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              {options.map((option) => {
                const isSelected = option.value === sortKey;
                return (
                  <button
                    key={option.value}
                    onClick={() => onSortChange(option.value)}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                      isSelected ? "bg-gold/15 text-gold font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={14} className="text-gold" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main List Showcase */}
      <HomeListShowcase
        t={t}
        lists={lists}
        listMovies={listMovies}
        watchedMovieIds={watchedMovieIds}
        wishlistMovies={listed}
      />
    </div>
  );
}
