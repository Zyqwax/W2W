import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send, CheckCheck, Check } from "lucide-react";
import clsx from "clsx";
import MovieRecommendCard from "./MovieRecommendCard";

// ── Chat presentation ────────────────────────────────────────────────────────
export default function ChatView({ chatData, friendProfile, messages, groupedMessages, user, isSeen, newMessage, sending, messagesEndRef, inputRef, onBack, onSend, onMessageChange, formatTime, formatDate }) {
  const friendUid = chatData.participants.find((participant) => participant !== user.uid);
  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-zinc-950 relative">
      {/* ── Top Header ───────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900/60 flex items-center gap-3 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition active:scale-90 shrink-0" aria-label="Geri"><ArrowLeft size={20} className="stroke-[2.5]" /></button>
        <Link href={`/u/${friendUid}`} className="flex items-center gap-3 flex-1 min-w-0 group">
          <div className="relative w-9 h-9 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700/50 shrink-0 shadow-sm">{friendProfile?.photoURL ? <Image src={friendProfile.photoURL} alt={friendProfile.displayName || ""} fill className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-rose-400 bg-rose-500/10">{friendProfile?.displayName?.[0]?.toUpperCase() || "?"}</span>}<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950" /></div>
          <div className="min-w-0"><p className="text-sm font-bold text-white truncate group-hover:text-rose-300 transition-colors">{friendProfile?.displayName || "Kullanıcı"}</p><p className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />çevrimiçi</p></div>
        </Link>
      </div>

      {/* ── Subtle background pattern ─────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0"><div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/3 rounded-full blur-[100px]" /></div>

      {/* ── Messages Scroll Area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 relative z-10"><div className="px-3 sm:px-5 py-4 flex flex-col min-h-full justify-end">
        {messages.length === 0 && <div className="flex flex-col items-center justify-center py-16 text-center select-none"><div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-sm"><span className="text-3xl">👋</span></div><p className="text-sm font-bold text-white">{friendProfile?.displayName || "Kullanıcı"} ile sohbet</p><p className="text-xs text-zinc-500 mt-1.5 max-w-xs leading-relaxed">Bir şey yazarak sohbeti başlat!</p></div>}
        <div className="flex flex-col gap-0">{groupedMessages.map((item, idx) => {
          if (item.type === "date") return <div key={`date-${item.date}`} className="flex justify-center py-4 select-none"><span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-semibold rounded-full">{formatDate(item.date)}</span></div>;
          const isMine = item.senderId === user.uid;
          const isLastMsg = messages.length > 0 && messages[messages.length - 1].id === item.id;
          const showTail = !item.isConsecutive;
          return <div key={item.id || idx} className={clsx("flex", isMine ? "justify-end" : "justify-start", item.isConsecutive ? "mt-0.5" : "mt-2.5")}>
            {!isMine && <div className="w-8 shrink-0 mr-1.5 flex items-end mb-1">{!item.isConsecutive ? <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700/50 shadow-sm shrink-0">{friendProfile?.photoURL ? <Image src={friendProfile.photoURL} alt="" width={28} height={28} className="object-cover" /> : <span className="text-[10px] font-black text-rose-400">{friendProfile?.displayName?.[0]?.toUpperCase() || "?"}</span>}</div> : <div className="w-7" />}</div>}
            {item.isMovie ? <div className="flex flex-col max-w-65"><MovieRecommendCard msg={item} isMine={isMine} />{item.text && <div className={clsx("px-3 py-2 mt-1 text-[13px] text-white leading-relaxed wrap-break-word whitespace-pre-wrap", isMine ? "bg-rose-950/60 rounded-[14px] rounded-tr-sm" : "bg-zinc-800/80 rounded-[14px] rounded-tl-sm")}>{item.text}</div>}<div className={clsx("flex items-center gap-1 mt-1 select-none", isMine ? "justify-end" : "justify-start")}><span className="text-[10px] text-zinc-600 leading-none">{formatTime(item.createdAt)}</span>{isMine && <span className="leading-none">{isLastMsg && isSeen ? <CheckCheck size={11} className="text-rose-400" /> : <Check size={11} className="text-zinc-600" />}</span>}</div></div> : <div className="max-w-[78%] sm:max-w-[60%]"><div className={clsx("px-3.5 py-2.5 shadow-sm", isMine ? clsx("bg-rose-600 text-white", showTail ? "rounded-[18px] rounded-tr-[5px]" : "rounded-[18px]") : clsx("bg-zinc-800 text-white", showTail ? "rounded-[18px] rounded-tl-[5px]" : "rounded-[18px]"))}><p className="text-[13.5px] leading-relaxed wrap-break-word whitespace-pre-wrap select-text">{item.text}</p><div className="flex items-center gap-1 mt-1 select-none justify-end"><span className={clsx("text-[10px] leading-none", isMine ? "text-white/50" : "text-zinc-500")}>{formatTime(item.createdAt)}</span>{isMine && <span className="leading-none">{isLastMsg && isSeen ? <CheckCheck size={12} className="text-white/70" /> : <Check size={12} className="text-white/40" />}</span>}</div></div></div>}
          </div>;
        })}</div><div ref={messagesEndRef} className="h-1" />
      </div></div>

      {/* ── Input Bar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900/60 px-3 py-2.5 z-10" style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom, 0px))" }}><form onSubmit={onSend} className="flex items-end gap-2 max-w-3xl mx-auto"><div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center px-4 py-2.5 gap-2 focus-within:border-rose-500/40 focus-within:ring-1 focus-within:ring-rose-500/20 transition-all min-h-11"><input ref={inputRef} type="text" value={newMessage} onChange={onMessageChange} placeholder="Mesaj yaz..." className="flex-1 bg-transparent border-none text-sm text-white placeholder-zinc-500 focus:outline-none min-w-0" /></div><button type="submit" disabled={sending || !newMessage.trim()} className={clsx("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-90 shadow-sm", newMessage.trim() ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25" : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed")} aria-label="Gönder"><Send size={17} className={clsx("stroke-[2.5]", newMessage.trim() && "translate-x-px")} /></button></form></div>
    </div>
  );
}
