import { ArrowUpDown, ChevronDown, Image as ImageIcon } from "lucide-react";
import { MovieCard } from "@/components/ArchiveUI";

export default function HomeLibrarySection({
  t,
  activeTab,
  wishlist,
  watched,
  listed,
  options,
  sortKey,
  sortOpen,
  sortRef,
  dayjsLocale,
  onTabChange,
  onSortToggle,
  onSortChange,
}) {
  return (
    <section className="mt-9 border-2 p-7 rounded-[18px] border-white/16">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
        <div className="relative min-h-11 py-2 pb-2.5 font-display text-[15px] font-extrabold uppercase tracking-[0.04em] text-ivory after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-gold">
          {t("home.wishlist")} <small className="font-mono text-[10.5px] font-normal text-muted">{wishlist.length}</small>
        </div>
        <div className="relative" ref={sortRef}>
          <button
            className="flex min-h-11 items-center gap-2 rounded-lg border border-white/16 bg-transparent px-3 py-2.25 text-xs text-muted"
            onClick={onSortToggle}
          >
            <ArrowUpDown size={14} />
            <span>
              {options.find((option) => option.value === sortKey)?.label}
            </span>
            <ChevronDown size={14} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-12 z-10 flex min-w-[190px] flex-col overflow-hidden rounded-[10px] border border-white/16 bg-surface2 shadow-[0_14px_30px_#0008]">
              {options.map((option) => (
                <button
                  key={option.value}
                  className="border-0 bg-transparent p-3 text-left text-xs text-muted hover:bg-surface3 hover:text-ivory"
                  onClick={() => onSortChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {listed.length ? (
        <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {listed.map((movie) => (
            <MovieCard key={movie.id} movie={movie} rating={movie.rating} status={movie.isWatched ? t("profile.watched") : undefined} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.25 px-5 py-15 text-center text-muted">
          <ImageIcon size={28} />
          <strong className="font-display text-xl uppercase text-ivory">
            {t("home.emptyTitle")}
          </strong>
          <span className="text-[13px]">
            {t("home.emptyText")}
          </span>
        </div>
      )}
    </section>
  );
}
