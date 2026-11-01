"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Globe2, Lock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

const posterPath = (movie) => movie?.posterPath || movie?.poster_path;

function Visibility({ list, t }) {
  const isPrivate = list.visibility === "private";
  const Icon = isPrivate ? Lock : Globe2;
  return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted"><Icon size={14} aria-hidden="true" />{isPrivate ? t("lists.private") : t("lists.public")}</span>;
}

export default function ListCard({ list, movies = [], t, editingId, editingName, onEditStart, onEditingNameChange, onSave, onVisibilityChange, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isDefault = list.id === "wishlist" || list.id === "watched";
  const title = list.id === "wishlist" ? t("home.wishlist") : list.id === "watched" ? t("home.watched") : list.name;
  const count = list.movieCount ?? list.count ?? movies.length;
  const isEditing = editingId === list.id;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClickOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <article className="group relative min-h-48 overflow-visible rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md">
      <Link href={`/lists/${list.id}`} aria-label={title} className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent" />
      <div className="relative z-10 flex h-full min-h-36 flex-col justify-between pointer-events-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-accent">{isDefault ? (list.id === "wishlist" ? t("lists.wishlist") : t("lists.watched")) : t("lists.custom")}</p>
            {isEditing ? <label className="block"><span className="sr-only">{t("lists.rename")}</span><input autoFocus value={editingName} onChange={(event) => onEditingNameChange(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onSave(list)} className="pointer-events-auto min-h-11 w-full rounded-xl border border-accent bg-surface px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent" /></label> : <h2 className="truncate text-xl font-extrabold tracking-tight text-text">{title}</h2>}
          </div>
          {!isDefault && <div className="pointer-events-auto relative" ref={menuRef}>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={t("lists.rename")} aria-expanded={menuOpen} className="grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><MoreHorizontal size={20} aria-hidden="true" /></button>
            {menuOpen && <div className="absolute right-0 top-12 z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-xl">
              {isEditing ? <button type="button" onClick={() => { onSave(list); setMenuOpen(false); }} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-text hover:bg-surface-2"><Check size={16} />{t("lists.save")}</button> : <button type="button" onClick={() => { onEditStart(list); setMenuOpen(false); }} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-text hover:bg-surface-2"><Pencil size={16} />{t("lists.rename")}</button>}
              <button type="button" onClick={() => { onVisibilityChange(list, list.visibility === "private" ? "public" : "private"); setMenuOpen(false); }} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-text hover:bg-surface-2"><Visibility list={list} t={t} /></button>
              {onDelete && <button type="button" onClick={() => { onDelete(list); setMenuOpen(false); }} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-danger hover:bg-danger/5"><Trash2 size={16} />{t("common.delete") || "Sil"}</button>}
            </div>}
          </div>}
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs text-text"><strong>{count}</strong> {t("common.film")}</span>
          <div className="flex -space-x-2" aria-hidden="true">{movies.slice(0, 4).map((movie, index) => <span key={movie.id || index} className="relative h-10 w-7 overflow-hidden rounded-md border-2 border-surface bg-surface-2">{posterPath(movie) && <Image src={`https://image.tmdb.org/t/p/w92${posterPath(movie)}`} alt="" fill sizes="28px" className="object-cover" unoptimized />}</span>)}</div>
        </div>
        <div className="mt-3"><Visibility list={list} t={t} /></div>
      </div>
    </article>
  );
}
