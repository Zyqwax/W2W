"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Dices, Image as ImageIcon, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { TicketStub } from "@/components/ArchiveUI";

const buttonBase =
  "flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-5.5 py-3 text-sm font-bold transition-[transform,filter,background] duration-150";

export default function HomeHero({ hero, t, wishlist, watched, onShuffle }) {
  const slides = useMemo(
    () => wishlist
      .filter((movie) => movie.backdropPath || movie.posterPath || movie.poster_path)
      .slice(0, 5),
    [wishlist],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMovie = slides[activeIndex] || hero;

  useEffect(() => {
    if (!slides.length) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const move = (direction) => {
    if (!slides.length) return;
    setActiveIndex((index) => (index + direction + slides.length) % slides.length);
  };

  const backdrop = activeMovie?.backdropPath || activeMovie?.posterPath || activeMovie?.poster_path;
  return (
    <section className="relative isolate -mx-6 mb-1.5 h-[570px] overflow-hidden bg-[#071116] max-lg:-mx-6 max-md:-mx-4 max-md:h-[610px]">
      {backdrop && (
        <Image
          key={activeMovie.id}
          className="absolute inset-0 z-0 h-full w-full object-cover object-center opacity-90 transition-opacity duration-500"
          src={`https://image.tmdb.org/t/p/${activeMovie.backdropPath ? "original" : "w780"}${backdrop}`}
          alt=""
          fill
          priority
          sizes="100vw"
          unoptimized
        />
      )}
      <div className="absolute inset-0 z-1 bg-[linear-gradient(90deg,#071116_0%,rgba(7,17,22,.94)_20%,rgba(7,17,22,.48)_56%,rgba(7,17,22,.1)_100%)] max-md:bg-[linear-gradient(0deg,#071116_5%,rgba(7,17,22,.78)_43%,rgba(7,17,22,.08)_100%)]" />
      <div className="absolute inset-0 z-1 bg-[linear-gradient(0deg,#071116_0%,transparent_35%,rgba(7,17,22,.22)_100%)]" />

      <div className="relative z-2 flex h-full flex-col justify-end px-10 pb-9 pt-24 max-md:px-5 max-md:pb-7">
        {activeMovie ? (
          <div className="max-w-[510px]">
            <div className="mb-4 inline-flex items-center gap-1.75 rounded-full bg-gold px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-gold-ink">
              <Play size={12} fill="currentColor" /> {t("home.lucky")}
            </div>
            <h1 className="mb-4 max-w-[470px] font-display text-[clamp(42px,6vw,76px)] font-black uppercase leading-[0.88] tracking-[-0.01em] text-ivory">
              {activeMovie.title}
            </h1>
            <div className="mb-4 flex flex-wrap items-center gap-2.5 font-mono text-[12px] text-ivory/75">
              <span>{activeMovie.releaseDate?.slice(0, 4) || "—"}</span>
              <b className="text-gold">·</b>
              <span>
                {activeMovie.runtime
                  ? `${activeMovie.runtime} ${t("home.runtime")}`
                  : t("home.archiveRecord")}
              </span>
              <b className="text-gold">·</b>
              <span>{activeMovie.genres?.[0] || t("home.film")}</span>
            </div>
            {activeMovie.overview && (
              <p className="mb-6 line-clamp-3 text-sm leading-6 text-ivory/85">
                {activeMovie.overview}
              </p>
            )}
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="flex gap-3">
                <Link
                  href={`/movie/${activeMovie.id}`}
                  className={clsx(buttonBase, "bg-gold text-gold-ink hover:-translate-y-px hover:brightness-[1.08]")}
                >
                  {t("home.details")}
                </Link>
                <button
                  className={clsx(buttonBase, "w-12 border border-white/20 bg-black/20 px-3 text-ivory hover:bg-white/10")}
                  onClick={() => {
                    move(1);
                    onShuffle?.();
                  }}
                  aria-label={t("home.shuffle")}
                >
                  <Dices size={16} />
                </button>
              </div>
              <TicketStub wishlist={wishlist.length} watched={watched.length} t={t} />
            </div>
          </div>
        ) : (
          <div className="flex min-h-50 items-center gap-2.5 text-muted">
            <ImageIcon size={28} />
            <span>{t("home.emptyWatchlist")}</span>
          </div>
        )}

        {slides.length > 1 && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2" aria-label="Önerilen filmler">
              {slides.map((movie, index) => (
                <button
                  key={movie.id}
                  type="button"
                  aria-label={movie.title}
                  aria-current={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                  className={clsx(
                    "h-1.5 rounded-full transition-all",
                    index === activeIndex ? "w-8 bg-ivory" : "w-1.5 bg-ivory/35 hover:bg-ivory/70",
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => move(-1)} aria-label="Önceki film" className="rounded-full border border-white/20 bg-black/20 p-2 text-ivory hover:bg-white/10">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => move(1)} aria-label="Sonraki film" className="rounded-full border border-white/20 bg-black/20 p-2 text-ivory hover:bg-white/10">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
