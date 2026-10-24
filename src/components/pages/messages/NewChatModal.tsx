import Image from "next/image";
import Link from "next/link";
import { Search, UserPlus, X } from "lucide-react";

// ── New chat modal presentation ─────────────────────────────────────────────
export default function NewChatModal({
  isOpen,
  friends,
  filteredFriends,
  searchQuery,
  modalLoading,
  onSearchChange,
  onClose,
  onStartChat,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
      onClick={(event) => { if (event.target === event.currentTarget && !modalLoading) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !modalLoading && onClose()} />
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800/60 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/50 overflow-hidden z-10 flex flex-col max-h-[75vh]">
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-zinc-700 rounded-full" /></div>

        <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Yeni Sohbet</h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">Arkadaş listenden seç</p>
          </div>
          <button onClick={onClose} disabled={modalLoading} className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition disabled:opacity-50">
            <X size={15} />
          </button>
        </div>

        {friends.length > 3 && (
          <div className="px-4 py-2.5 border-b border-zinc-800/40">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" value={searchQuery} onChange={onSearchChange} placeholder="Arkadaş ara..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500/40" />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {friends.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"><UserPlus size={20} className="text-zinc-600" /></div>
              <p className="text-xs text-zinc-500 leading-relaxed">Sohbet başlatmak için arkadaşın olması gerekiyor.</p>
              <Link href="/profile" onClick={onClose} className="px-4 py-2 bg-rose-600/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold transition hover:bg-rose-600/20">Profil Linkini Paylaş</Link>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">Sonuç bulunamadı</div>
          ) : (
            filteredFriends.map((friend) => (
              <button key={friend.id} disabled={modalLoading} onClick={() => onStartChat(friend.uid)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-zinc-900/70 active:bg-zinc-900 text-left transition-colors outline-none border border-transparent hover:border-zinc-800/50 disabled:opacity-50">
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700/50 shrink-0">
                  {friend.photoURL ? <Image src={friend.photoURL} alt={friend.displayName || ""} width={40} height={40} className="object-cover h-full w-full" /> : <span className="text-sm font-black text-rose-400 bg-rose-500/10 w-full h-full flex items-center justify-center">{friend.displayName?.[0]?.toUpperCase() || "?"}</span>}
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-zinc-100 truncate">{friend.displayName || "Kullanıcı"}</p></div>
                <div className="shrink-0 w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-rose-500 opacity-0 group-hover:opacity-100" /></div>
              </button>
            ))
          )}
        </div>

        {modalLoading && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-rose-500" /></div>}
      </div>
    </div>
  );
}
