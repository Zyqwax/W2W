"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Globe2, Lock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

const posterPath = (movie) => movie?.posterPath || movie?.poster_path;

function Visibility({ list, t }) {
  const isPrivate = list.visibility === "private";
  const Icon = isPrivate ? Lock : Globe2;
  return <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Icon size={14} aria-hidden="true" />{isPrivate ? t("lists.private") : t("lists.public")}</span>;
}

export default function ListCard({ list, movies = [], t, editingId, editingName, onEditStart, onEditingNameChange, onSave, onVisibilityChange, onDelete, featured = false }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isDefault = list.id === "wishlist" || list.id === "watched";
  const title = list.id === "wishlist" ? t("home.wishlist") : list.id === "watched" ? t("home.watched") : list.name;
  const count = list.movieCount ?? list.count ?? movies.length;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const openListOnCardClick = (event) => {
    if (event.target.closest("button, input, a")) return;
    router.push(`/lists/${list.id}`);
  };

  const isEditing = editingId === list.id;
  return (
    <article onClick={openListOnCardClick} className={`group relative cursor-pointer rounded-[var(--radius-lg)] border border-[#343432] bg-[#1c1c1b] transition-colors duration-200 hover:border-[#4a4a46] ${featured ? "min-h-32 md:min-h-36" : "min-h-32"}`}>
      <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-lg)]">
        <div className="absolute inset-0 bg-[linear-gradient(140deg,#242422,#171716_72%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-1/2 overflow-hidden opacity-25 transition-opacity group-hover:opacity-35">
          {[0, 1, 2, 3].map((index) => {
            const path = posterPath(movies[index]);
            return <div key={movies[index]?.id || index} className="relative min-w-0 flex-1 border-l border-[#111110]/60 bg-[#20201e]">
              {path && <Image src={`https://image.tmdb.org/t/p/w342${path}`} alt="" fill sizes="120px" className="object-cover" unoptimized />}
            </div>;
          })}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#242422] via-[#242422]/95 to-[#242422]/45" />
      </div>
      <Link href={`/lists/${list.id}`} className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent" aria-label={title} />
      <div className="relative z-10 flex min-h-32 flex-col justify-between p-4 md:p-5">
        <div className="flex min-h-20 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted">{isDefault ? (list.id === "wishlist" ? t("lists.wishlist") : t("lists.watched")) : t("lists.custom")}</p>
            {isEditing ? <input autoFocus value={editingName} onChange={(event) => onEditingNameChange(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onSave(list)} className="min-h-10 w-full rounded-[var(--radius-md)] border border-accent bg-bg/80 px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent" /> : <h2 className="truncate font-syne text-lg font-semibold text-text md:text-xl">{title}</h2>}
          </div>
          {!isDefault && <div className="relative" ref={menuRef}>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={t("lists.rename")} aria-expanded={menuOpen} className="relative z-20 flex min-h-11 min-w-11 items-center justify-center rounded-full text-text transition-colors hover:bg-bg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><MoreHorizontal size={19} aria-hidden="true" /></button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 min-w-44 overflow-hidden rounded-[var(--radius-md)] border border-border bg-[#18181b] p-1.5 shadow-2xl shadow-black/80 backdrop-blur-md">
                {isEditing ? (
                  <button type="button" onClick={() => { onSave(list); setMenuOpen(false); }} className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-xs font-medium text-text hover:bg-white/10"><Check size={15} aria-hidden="true" />{t("lists.save")}</button>
                ) : (
                  <button type="button" onClick={() => { onEditStart(list); setMenuOpen(false); }} className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-xs font-medium text-text hover:bg-white/10"><Pencil size={15} aria-hidden="true" />{t("lists.rename")}</button>
                )}
                <button type="button" onClick={() => { onVisibilityChange(list, list.visibility === "private" ? "public" : "private"); setMenuOpen(false); }} className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-xs font-medium text-text hover:bg-white/10"><Visibility list={list} t={t} /></button>
                {onDelete && (
                  <button type="button" onClick={() => { onDelete(list); setMenuOpen(false); }} className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-xs font-medium text-danger hover:bg-danger/10"><Trash2 size={15} aria-hidden="true" />{t("common.delete") || "Sil"}</button>
                )}
              </div>
            )}
          </div>}
        </div>
        <div className="relative z-10 flex items-end justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg/35 px-2.5 py-1 text-[11px] text-text"><strong>{count}</strong> {t("common.film")}</span>
          <Visibility list={list} t={t} />
        </div>
      </div>
    </article>
  );
}
