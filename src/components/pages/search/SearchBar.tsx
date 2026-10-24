"use client";

import { LoaderCircle, Search, X } from "lucide-react";

export default function SearchBar({ queryInput, loading, isDebouncing, inputRef, title, placeholder, onInputChange, onClear, onSearch }) {
  const isActive = queryInput.trim().length > 0 || isDebouncing;

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-bg/90 px-4 pb-5 pt-5 backdrop-blur-md md:px-0 md:pt-8">
      <h1 className="mb-4 font-syne text-2xl font-bold text-text md:text-3xl">{title}</h1>
      <form onSubmit={onSearch} className={`group relative flex min-h-12 items-center rounded-[var(--radius-full)] border bg-surface px-4 transition-[border-color,box-shadow] ${isActive ? "border-accent shadow-[0_0_0_3px_var(--color-accent-glow)]" : "border-[--color-border] focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--color-accent-glow)]"}`}>
        {loading ? <LoaderCircle size={18} className="shrink-0 animate-spin text-accent" aria-hidden="true" /> : <Search size={18} className={`shrink-0 transition-colors ${isActive ? "text-accent" : "text-muted"}`} aria-hidden="true" />}
        <input
          ref={inputRef}
          type="search"
          value={queryInput}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-text outline-none placeholder:text-muted"
        />
        {queryInput && (
          <button type="button" onClick={onClear} aria-label={title} className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </form>
    </header>
  );
}
