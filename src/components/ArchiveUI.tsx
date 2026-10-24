"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Film, Play, Shuffle } from "lucide-react";

const buttonVariants = {
  gold: "bg-gold text-gold-ink hover:brightness-108",
  ghost: "border border-white/16 bg-transparent text-ivory hover:bg-white/4",
};

const baseButton =
  "flex min-h-11 items-center justify-center gap-2.25 rounded-[10px] px-5.5 py-3 font-body text-sm font-bold transition-[transform,filter,background] duration-150 hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50";

export function PerfStrip({ className = "" }) {
  return (
    <div
      className={clsx("flex items-center gap-2.25", className)}
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((dot) => (
        <i
          key={`start-${dot}`}
          className="h-1.75 w-1.75 shrink-0 rounded-full bg-gold"
        />
      ))}
      <b className="h-px flex-1 bg-linear-to-r from-transparent via-white/16 to-transparent" />
      {[0, 1, 2, 3].map((dot) => (
        <i
          key={`end-${dot}`}
          className="h-1.75 w-1.75 shrink-0 rounded-full bg-gold"
        />
      ))}
    </div>
  );
}

export function TicketStub({ wishlist = 0, watched = 0, t }) {
  const label = (key, fallback) => (t ? t(key) : fallback);
  return (
    <div
      className="flex justify-center"
      aria-label={`${wishlist} ${label("profile.wishlist", "listede")}, ${watched} ${label("profile.watched", "izlendi")}`}
    >
      {[
        [wishlist, label("profile.wishlist", "Listede")],
        [watched, label("profile.watched", "İzlendi")],
      ].map(([value, label], index) => (
        <div
          key={label}
          className={clsx(
            "min-w-22 px-5.5 py-2.5 text-center font-mono",
            index > 0 && "border-l border-dashed border-white/16",
          )}
        >
          <span className="block font-display text-[26px] font-black leading-none text-gold">
            {value}
          </span>
          <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ArchiveButton({
  children,
  variant = "gold",
  className = "",
  ...props
}) {
  return (
    <button
      className={clsx(
        baseButton,
        buttonVariants[variant] || buttonVariants.gold,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function posterUrl(movie, size = "w342") {
  const path = movie?.posterPath || movie?.poster_path;
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export interface ArchiveMovieCardProps {
  movie: any;
  href?: string;
  rating?: number | null;
  status?: string | null;
  subtitle?: string | null;
  compact?: boolean;
}

export function MovieCard({
  movie,
  href,
  rating,
  status,
  subtitle,
  compact = false,
}: ArchiveMovieCardProps) {
  const image = posterUrl(movie, compact ? "w185" : "w342");
  const score = rating ?? movie?.rating ?? movie?.vote_average;
  const year =
    movie?.releaseDate?.slice(0, 4) || movie?.release_date?.slice(0, 4);
  const genre = subtitle || movie?.genres?.[0] || "Film arşivi";
  return (
    <Link
      href={href || `/movie/${movie.id}`}
      className="group block cursor-pointer overflow-hidden rounded-[13px] border border-white/9 bg-surface1 text-ivory no-underline transition-[transform,border-color] duration-180 hover:border-gold-dim md:hover:-translate-y-1 active:scale-[0.985] active:brightness-88"
    >
      <div className="relative flex h-[190px] items-end bg-linear-to-br from-surface3 to-void p-3 max-md:h-[180px]">
        {image ? (
          <Image
            src={image}
            alt={movie.title || "Film posteri"}
            fill
            sizes="(max-width: 768px) 45vw, (max-width: 1024px) 25vw, 220px"
            loading="lazy"
            className="absolute inset-0 object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center font-mono text-[11px] font-medium text-muted">
            <Film size={22} />
            <span>{movie.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-void/88" />
        {score > 0 && (
          <span className="absolute right-2.25 top-2.25 z-2 flex h-7.5 w-7.5 items-center justify-center rounded-full border-2 border-gold bg-void font-mono text-[10.5px] text-gold">
            {Number(score).toFixed(1)}
          </span>
        )}
        {status && (
          <span className="absolute left-2.25 top-2.25 z-2 font-mono text-[9px] font-semibold uppercase text-gold">
            {status}
          </span>
        )}
        <span className="relative z-2 overflow-hidden text-ellipsis whitespace-nowrap font-body text-[13px] font-bold">
          {movie.title}
        </span>
      </div>
      <div className="border-t border-dashed border-white/9 px-3.25 pb-3.25 pt-2.75">
        <div className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-bold">
          {movie.title}
        </div>
        <div className="font-mono text-[10.5px] text-muted">
          {year || "—"} · {genre}
        </div>
      </div>
    </Link>
  );
}

export function EmptyArchive({
  title = "Arşiv boş",
  text = "Keşfet bölümünden ilk filmi ekleyebilirsin.",
}) {
  return (
    <div className="flex flex-col items-center gap-2.25 px-5 py-15 text-center text-muted">
      <Film size={28} />
      <strong className="font-display text-xl font-extrabold uppercase text-ivory">
        {title}
      </strong>
      <span className="text-[13px]">{text}</span>
    </div>
  );
}

export function HeroActions({ href, onShuffle }) {
  return (
    <div className="flex w-full gap-3 sm:w-auto">
      <Link
        href={href}
        className={clsx(baseButton, buttonVariants.gold, "flex-1 sm:flex-none")}
      >
        <Play size={16} fill="currentColor" /> Detayları Gör
      </Link>
      <button
        className={clsx(baseButton, buttonVariants.ghost, "w-12 px-3")}
        onClick={onShuffle}
        aria-label="Şanslı filmi değiştir"
      >
        <Shuffle size={16} />
      </button>
    </div>
  );
}
