"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Dices, Film, Plus, Sparkles, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import PageLoading from "@/components/ui/PageLoading";

function PosterCard({ movie, language }) {
  const poster = movie.posterPath || movie.poster_path;
  return (
    <Link href={`/movie/${movie.id}`} className="group block w-[145px] shrink-0 sm:w-[166px]">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-surface-2 shadow-sm ring-1 ring-black/5 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
        {poster ? <Image src={`https://image.tmdb.org/t/p/w342${poster}`} alt={movie.title || "Film posteri"} fill sizes="(max-width: 640px) 145px, 166px" className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><Film /></div>}
        {movie.voteAverage > 0 && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-text shadow-sm"><Star size={12} className="fill-amber-500 text-amber-500" />{Number(movie.voteAverage).toFixed(1)}</span>}
        {movie.isWatched && <span className="absolute bottom-2 left-2 rounded-full bg-success px-2.5 py-1 text-[11px] font-semibold text-white">{language === "en" ? "Watched" : "İzlendi"}</span>}
      </div>
      <p className="mt-3 truncate text-sm font-bold text-text group-hover:text-accent">{movie.title}</p>
      <p className="mt-1 text-xs text-muted">{movie.releaseDate?.slice(0, 4) || movie.release_date?.slice(0, 4) || ""}</p>
    </Link>
  );
}

export default function Home() {
  const { user, loading, language } = useAuth();
  const { movies = [], lists, listMovies, watchedMovieIds } = useAppData();
  const router = useRouter();
  const [spotlightId, setSpotlightId] = useState(null);
  const hasSelectedSpotlight = useRef(false);
  const wishlist = useMemo(() => movies.filter((movie) => movie.status === "wishlist"), [movies]);
  const watched = useMemo(() => movies.filter((movie) => movie.isWatched).sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0)), [movies]);
  const spotlight = wishlist.find((movie) => String(movie.id) === String(spotlightId)) || wishlist[0];
  const customLists = (lists || []).filter((list) => list.type === "custom").slice(0, 3);

  useEffect(() => {
    if (hasSelectedSpotlight.current || !wishlist.length) return;
    hasSelectedSpotlight.current = true;
    const nextMovie = wishlist[Math.floor(Math.random() * wishlist.length)];
    setSpotlightId(nextMovie.id);
  }, [wishlist]);

  useEffect(() => {
    if (!loading && user === null) router.push("/login");
  }, [user, loading, router]);

  const pickMovie = () => {
    if (!wishlist.length) return router.push("/search");
    const candidates = wishlist.filter((movie) => String(movie.id) !== String(spotlight?.id));
    const pool = candidates.length ? candidates : wishlist;
    const nextMovie = pool[Math.floor(Math.random() * pool.length)];
    setSpotlightId(nextMovie.id);
  };

  if (loading) return <PageLoading />;
  if (!user) return null;

  const isEnglish = language === "en";
  const title = user.displayName?.split(" ")[0] || (isEnglish ? "there" : "film sever");
  const heroImage = spotlight?.backdropPath || spotlight?.backdrop_path || spotlight?.posterPath || spotlight?.poster_path;
  const spotlightPoster = spotlight?.posterPath || spotlight?.poster_path;
  const spotlightRating = Number(spotlight?.voteAverage ?? spotlight?.vote_average ?? spotlight?.rating);
  const recent = watched.slice(0, 5);

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-accent">{isEnglish ? "Your film corner" : "Film köşen"}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{isEnglish ? `Welcome, ${title}` : `Hoş geldin, ${title}`}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">{isEnglish ? "Keep your next watch close and your film history in one place." : "Sıradaki filmini kolayca bul, izleme geçmişin elinin altında olsun."}</p>
        </div>
        <Link href="/lists" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-border bg-surface px-4 text-sm font-semibold text-text transition hover:border-accent/40 hover:text-accent sm:self-auto">{isEnglish ? "My lists" : "Listelerim"}<ArrowRight size={16} /></Link>
      </section>

      <section className="relative isolate mb-11 min-h-[320px] overflow-hidden rounded-[28px] bg-[#09090b] shadow-sm sm:min-h-[410px]" aria-labelledby="pick-title">
        {heroImage && <Image src={`https://image.tmdb.org/t/p/original${heroImage}`} alt="" fill priority sizes="(max-width: 1024px) 100vw, 1200px" className="object-cover object-center opacity-75" unoptimized />}
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/95 via-[#09090b]/65 to-[#09090b]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/65 via-transparent to-[#09090b]/10" />
        {spotlightPoster && <div className="absolute right-[8%] top-1/2 z-0 hidden aspect-[2/3] w-40 -translate-y-1/2 overflow-hidden rounded-2xl shadow-[0_24px_70px_#000c] ring-1 ring-white/20 md:block lg:right-[10%] lg:w-48">
          <Image src={`https://image.tmdb.org/t/p/w500${spotlightPoster}`} alt={spotlight?.title || "Film posteri"} fill sizes="192px" className="object-cover" unoptimized />
        </div>}
        <div className="relative z-10 flex min-h-[320px] flex-col justify-end p-6 sm:min-h-[410px] sm:p-9 lg:max-w-3xl lg:p-12">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur"><Sparkles size={14} />{isEnglish ? "A little inspiration" : "Biraz ilham"}</span>
          {spotlight ? <>
            <p className="mb-2 text-sm font-semibold text-white/85">{isEnglish ? "From your watchlist" : "İzleme listenden"}</p>
            <h2 id="pick-title" className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:max-w-[62%]">{spotlight.title}</h2>
            <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-sm font-bold text-white shadow backdrop-blur">
              <Star size={15} className="fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>{spotlightRating > 0 ? spotlightRating.toFixed(1) : "—"}</span>
              <span className="text-xs font-medium text-white/70">TMDB</span>
            </div>
            <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-white/90 md:max-w-[62%]">{spotlight.overview || (isEnglish ? "One of the films you saved for later." : "Sonra izlemek için ayırdığın filmlerden biri.")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/movie/${spotlight.id}`} className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#24253a] transition hover:bg-[#efede6]">{isEnglish ? "See film" : "Filmi incele"}<ArrowRight size={16} className="ml-2" /></Link>
              <button type="button" onClick={pickMovie} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"><Dices size={17} />{isEnglish ? "Pick another" : "Başka film seç"}</button>
            </div>
          </> : <>
            <h2 id="pick-title" className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">{isEnglish ? "What are we watching?" : "Bugün ne izlesek?"}</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">{isEnglish ? "Find a film you love and save it for the right evening." : "Seveceğin bir film bul, doğru akşam için listene ekle."}</p>
            <Link href="/search" className="mt-6 inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#24253a] transition hover:bg-[#efede6]"><Compass size={17} />{isEnglish ? "Discover films" : "Film keşfet"}<ArrowRight size={16} /></Link>
          </>}
        </div>
      </section>

      <div className="grid gap-12">
        <section aria-labelledby="watchlist-title">
          <header className="mb-5 flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-accent">{isEnglish ? "Saved for later" : "Sonra izlemek için"}</p><h2 id="watchlist-title" className="mt-1 text-2xl font-extrabold tracking-tight text-text">{isEnglish ? "My watchlist" : "İzleme listem"}<span className="ml-2 align-middle text-sm font-semibold text-muted">{wishlist.length}</span></h2></div>
            <Link href="/lists/wishlist" className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-accent hover:underline">{isEnglish ? "See all" : "Tümünü gör"}<ArrowRight size={15} /></Link>
          </header>
          {wishlist.length ? <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 scrollbar-hide sm:mx-0 sm:px-0">{wishlist.slice(0, 8).map((movie) => <PosterCard key={movie.id} movie={movie} language={language} />)}</div> : <div className="rounded-2xl border border-dashed border-border bg-surface/70 px-5 py-7"><p className="font-bold text-text">{isEnglish ? "Your watchlist is ready" : "İzleme listen seni bekliyor"}</p><p className="mt-1 text-sm text-muted">{isEnglish ? "Save films you want to watch later." : "Sonra izlemek istediklerini buraya ekle."}</p><Link href="/search" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-bold text-white"><Plus size={16} />{isEnglish ? "Find a film" : "Film bul"}</Link></div>}
        </section>

        <section aria-labelledby="recent-title">
          <header className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{isEnglish ? "Your history" : "İzleme geçmişin"}</p><h2 id="recent-title" className="mt-1 text-2xl font-extrabold tracking-tight text-text">{isEnglish ? "Recently watched" : "Son izlediklerin"}</h2></div><Link href="/lists/watched" className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-accent hover:underline">{isEnglish ? "Full history" : "Tüm geçmiş"}<ArrowRight size={15} /></Link></header>
          {recent.length ? <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 scrollbar-hide sm:mx-0 sm:px-0">{recent.map((movie) => <PosterCard key={movie.id} movie={movie} language={language} />)}</div> : <p className="rounded-2xl bg-surface-2 px-5 py-6 text-sm text-muted">{isEnglish ? "Films you mark as watched will appear here." : "İzlendi olarak işaretlediğin filmler burada görünecek."}</p>}
        </section>

        {customLists.map((list) => {
          const items = listMovies?.[list.id] || [];
          return <section key={list.id} aria-labelledby={`home-list-${list.id}`}>
            <header className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{isEnglish ? "Your collection" : "Koleksiyonun"}</p><h2 id={`home-list-${list.id}`} className="mt-1 text-2xl font-extrabold tracking-tight text-text">{list.name}<span className="ml-2 align-middle text-sm font-semibold text-muted">{items.length}</span></h2></div><Link href={`/lists/${list.id}`} className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-accent hover:underline">{isEnglish ? "See list" : "Listeye git"}<ArrowRight size={15} /></Link></header>
            {items.length ? <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 scrollbar-hide sm:mx-0 sm:px-0">{items.slice(0, 8).map((movie) => <PosterCard key={movie.id} movie={{ ...movie, isWatched: Boolean(movie.isWatched || watchedMovieIds.includes(String(movie.id))) }} language={language} />)}</div> : <p className="rounded-2xl bg-surface-2 px-5 py-6 text-sm text-muted">{isEnglish ? "Add films from any film page." : "Film sayfalarından bu listeye ekleme yapabilirsin."}</p>}
          </section>;
        })}
      </div>
    </div>
  );
}
