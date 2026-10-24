import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Plus, CheckCheck } from "lucide-react";
import clsx from "clsx";
import NewChatModal from "./NewChatModal";

// ── Messages presentation ────────────────────────────────────────────────────
export default function MessagesView({
  chats,
  chatUsers,
  loading,
  user,
  friends,
  filteredFriends,
  isModalOpen,
  modalLoading,
  searchQuery,
  onOpenModal,
  onCloseModal,
  onSearchChange,
  onStartChat,
  formatChatTime,
}) {
  return (
    <div className="min-h-full bg-zinc-950 flex flex-col">
      {/* ── Sticky Header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900/60 px-4 pt-5 pb-3.5">
        <div className="flex items-center justify-between"><div><h1 className="text-xl font-bold text-white tracking-tight">Sohbetler</h1><p className="text-[11px] text-zinc-500 mt-0.5">Arkadaşlarınla mesajlaş</p></div><button onClick={onOpenModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/20"><Plus size={14} className="stroke-[2.5]" /><span>Yeni</span></button></div>
      </div>

      {/* ── Chat List ────────────────────────────────────────────────── */}
      <div className="flex-1">
        {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-rose-500" /></div> : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 px-6 text-zinc-500"><div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4"><MessageCircle className="w-7 h-7 text-rose-500 opacity-70" /></div><p className="text-sm font-semibold text-zinc-400 mb-1">Henüz sohbet yok</p><p className="text-[11px] text-zinc-600 text-center max-w-[220px] leading-relaxed">Sağ üstteki &quot;Yeni&quot; butonuna basarak arkadaşlarınla konuşmaya başla!</p><button onClick={onOpenModal} className="mt-5 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-rose-600/20">Sohbet Başlat</button></div>
        ) : <div className="flex flex-col pt-1">{chats.map((chat) => {
          const friendUid = chat.participants.find((participant) => participant !== user.uid);
          const friend = chatUsers[friendUid];
          const isUnread = chat.unreadBy?.includes(user.uid);
          const isMySent = chat.lastMessageSenderId === user.uid;
          return <Link key={chat.id} href={`/messages/${chat.id}`} className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-zinc-900/50 active:bg-zinc-900/70 transition-colors border-b border-zinc-900/40 last:border-0">
            <div className="relative shrink-0"><div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700/50 shadow-sm">{friend?.photoURL ? <Image src={friend.photoURL} alt={friend.displayName || ""} width={48} height={48} className="object-cover h-full w-full" /> : <span className="text-lg font-black text-rose-400 bg-rose-500/10 w-full h-full flex items-center justify-center">{friend?.displayName?.[0]?.toUpperCase() || "?"}</span>}</div><span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950" /></div>
            <div className="flex-1 min-w-0"><div className="flex items-center justify-between gap-2 mb-0.5"><p className={clsx("text-sm truncate", isUnread ? "font-bold text-white" : "font-semibold text-zinc-200")}>{friend?.displayName || "Kullanıcı"}</p>{chat.lastMessageAt && <span className={clsx("text-[10px] font-semibold shrink-0", isUnread ? "text-rose-400" : "text-zinc-600")}>{formatChatTime(chat.lastMessageAt)}</span>}</div><div className="flex items-center gap-1.5">{isMySent && <CheckCheck size={12} className="text-rose-400/70 shrink-0" />}<p className={clsx("text-xs truncate flex-1 leading-normal", isUnread ? "font-semibold text-zinc-200" : "text-zinc-500")}>{chat.lastMessage || "Sohbet başlatıldı"}</p>{isUnread && <span className="shrink-0 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">1</span>}</div></div>
          </Link>;
        })}</div>}
      </div>

      {/* ── New Chat Modal ────────────────────────────────────────────── */}
      <NewChatModal isOpen={isModalOpen} friends={friends} filteredFriends={filteredFriends} searchQuery={searchQuery} modalLoading={modalLoading} onSearchChange={onSearchChange} onClose={onCloseModal} onStartChat={onStartChat} />
    </div>
  );
}
