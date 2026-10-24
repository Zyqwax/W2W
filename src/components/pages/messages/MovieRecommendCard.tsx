import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

// ── Movie recommendation presentation ───────────────────────────────────────
export default function MovieRecommendCard({ msg, isMine }) {
  return (
    <Link href={`/movie/${msg.movieId}`} className={clsx("flex gap-3 rounded-2xl overflow-hidden border transition-all max-w-65 active:scale-[0.98]", isMine ? "bg-rose-950/40 border-rose-500/20 hover:border-rose-500/40" : "bg-zinc-800/60 border-zinc-700/50 hover:border-zinc-600")}>
      {msg.moviePoster && <div className="w-14 shrink-0 relative aspect-2/3"><Image src={`https://image.tmdb.org/t/p/w92${msg.moviePoster}`} alt={msg.movieTitle || "Film"} fill className="object-cover" unoptimized /></div>}
      <div className="flex-1 min-w-0 py-2.5 pr-3 flex flex-col justify-center gap-1"><span className="text-[9px] font-extrabold text-rose-400 uppercase tracking-widest">🎬 Film Önerisi</span><p className="text-[12px] font-bold text-white leading-snug line-clamp-2">{msg.movieTitle || "Film"}</p><span className="text-[10px] text-zinc-400">Detaylar →</span></div>
    </Link>
  );
}
