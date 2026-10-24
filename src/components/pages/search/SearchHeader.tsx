import { SearchIcon, X } from "lucide-react";
import clsx from "clsx";

export default function SearchHeader({ queryInput, loading, isDebouncing, inputRef, title, placeholder, onInputChange, onClear, onSearch }) {
  return (
    <div className="sticky top-0 z-30 border-b border-zinc-900/60 px-4 pb-3 pt-5 backdrop-blur-md">
      <h1 className="mb-3 text-xl font-bold tracking-tight text-white">{title}</h1>
      <div className="relative">
        <form onSubmit={onSearch} className="group relative flex h-12 w-full items-center gap-2 rounded-full border border-white/16 bg-surface1 px-3.5 text-muted focus-within:border-gold-dim focus-within:shadow-[0_0_0_3px_rgb(231_178_63_/_10%)]">
          <input ref={inputRef} type="text" value={queryInput} onChange={(e) => onInputChange(e.target.value)} placeholder={placeholder} autoComplete="off" className="h-[46px] min-w-0 flex-1 bg-transparent px-0 pl-8 font-body text-[13px] font-medium text-ivory outline-none placeholder:text-muted" />
          {loading ? <span className="absolute left-3.5 top-1/2 -translate-y-1/2"><span className="block h-4.5 w-4.5 animate-spin rounded-full border-2 border-zinc-600 border-t-rose-500" /></span> : <SearchIcon className={clsx("absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-rose-400", isDebouncing && "animate-pulse text-rose-400")} size={18} />}
          {queryInput && <button type="button" onClick={onClear} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 transition-all hover:text-white active:scale-90"><X size={17} /></button>}
        </form>
      </div>
    </div>
  );
}
