import Image from "next/image";
import { ArrowLeft, Calendar, Clock, TrendingUp } from "lucide-react";
import { PerfStrip } from "@/components/ArchiveUI";

export default function MovieBackdropHeader({ movie, onBack }) {
  return (
    <div className="relative w-full h-64 md:h-[55vh]">
      <div className="absolute top-4 left-5 right-5 z-10"><PerfStrip className="top" /></div>
      {movie.backdropPath ? <Image src={`https://image.tmdb.org/t/p/original${movie.backdropPath}`} alt={movie.title} fill className="object-cover opacity-40" unoptimized /> : <div className="w-full h-full bg-zinc-900" />}
      <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/30 to-black/40" />
      <div className="absolute inset-0 bg-linear-to-r from-zinc-950/80 via-transparent to-transparent hidden md:block" />
      <button onClick={onBack} className="absolute top-5 left-5 p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition"><ArrowLeft size={22} /></button>

      <div className="hidden md:flex absolute bottom-8 left-0 right-0 px-8 max-w-6xl mx-auto items-end gap-6">
        <div className="w-36 h-52 rounded-2xl overflow-hidden shrink-0 shadow-2xl shadow-black/70 border border-white/10 relative bg-zinc-800">
          {movie.posterPath && <Image src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`} alt={movie.title} fill className="object-cover" unoptimized />}
        </div>
        <div className="pb-1">
          <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-xl mb-3">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-medium text-zinc-300 mb-3">
            {movie.releaseDate && <span className="flex items-center gap-1.5"><Calendar size={15} />{movie.releaseDate.split("-")[0]}</span>}
            {movie.runtime > 0 && <span className="flex items-center gap-1.5"><Clock size={15} />{movie.runtime} dk</span>}
            {movie.voteAverage > 0 && <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-400/15 text-amber-300 rounded-full border border-amber-400/20 text-xs font-bold"><TrendingUp size={13} />{movie.voteAverage}/10</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">{movie.genres.map((g) => <span key={g} className="px-3 py-1 bg-white/10 backdrop-blur-sm text-zinc-200 rounded-full text-xs border border-white/10">{g}</span>)}</div>
        </div>
      </div>
      <div className="absolute bottom-3 left-5 right-5 z-10"><PerfStrip /></div>
    </div>
  );
}
