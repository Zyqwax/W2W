"use client";

import { useEffect, useState, useRef, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db-client";
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from "@/lib/store-client";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";
import ComingSoon from "@/components/ComingSoon";
import ChatView from "@/components/pages/messages/ChatView";

dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.locale("tr");

// ── Controller ──────────────────────────────────────────────────────────────
export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const unwrappedParams = use(params);
  const chatId = unwrappedParams.chatId;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chatData, setChatData] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = (behavior = "smooth") => messagesEndRef.current?.scrollIntoView({ behavior });

  // ── Authentication and realtime chat data ────────────────────────────────
  useEffect(() => {
    if (!authLoading && user === null) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !chatId) return;
    const unsub = onSnapshot(doc(db, "chats", chatId), async (snap) => {
      if (!snap.exists()) { setLoading(false); return; }
      const data = snap.data();
      setChatData(data);
      if (!data.participants.includes(user.uid)) { router.push("/messages"); return; }
      const friendUid = data.participants.find((participant) => participant !== user.uid);
      if (friendUid && !friendProfile) {
        const friendSnap = await getDoc(doc(db, "users", friendUid));
        if (friendSnap.exists()) setFriendProfile(friendSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user, chatId, router, friendProfile]);

  // ── Read state and realtime messages ─────────────────────────────────────
  useEffect(() => {
    if (!user || !chatId || !chatData) return;
    if (chatData.unreadBy?.includes(user.uid)) updateDoc(doc(db, "chats", chatId), { unreadBy: arrayRemove(user.uid) }).catch((err) => console.error("Error removing unreadBy:", err));
  }, [user, chatId, chatData]);

  useEffect(() => {
    if (!user || !chatId) return;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((item) => msgs.push({ id: item.id, ...item.data() }));
      setMessages(msgs);
      setTimeout(() => scrollToBottom("auto"), 80);
    });
    return () => unsub();
  }, [user, chatId]);

  // ── Message actions ──────────────────────────────────────────────────────
  const handleSend = async (event) => {
    event.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const text = newMessage.trim();
    setNewMessage("");
    try {
      const friendUid = chatData.participants.find((participant) => participant !== user.uid);
      await addDoc(collection(db, "chats", chatId, "messages"), { senderId: user.uid, text, type: "text", createdAt: serverTimestamp() });
      await updateDoc(doc(db, "chats", chatId), { lastMessage: text, lastMessageAt: serverTimestamp(), lastMessageSenderId: user.uid, unreadBy: arrayUnion(friendUid) });
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // ── Derived presentation data ────────────────────────────────────────────
  const groupedMessages = [];
  let prevMsg = null;
  messages.forEach((msg) => {
    const msgDate = msg.createdAt ? dayjs(msg.createdAt.toDate?.() || msg.createdAt).format("YYYY-MM-DD") : "";
    const prevDate = prevMsg?.msgDate || "";
    if (msgDate && msgDate !== prevDate) groupedMessages.push({ type: "date", date: msgDate });
    const createdAtMs = msg.createdAt?.toDate?.() ? msg.createdAt.toDate().getTime() : msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
    const prevCreatedAtMs = prevMsg?.createdAtMs || 0;
    const isMovie = msg.type === "movie_recommendation" || !!msg.movieId;
    const isConsecutive = prevMsg && prevMsg.senderId === msg.senderId && msgDate === prevDate && createdAtMs - prevCreatedAtMs < 3 * 60 * 1000 && !isMovie && !prevMsg?.isMovie;
    const item = { type: "message", isConsecutive, isMovie, msgDate, createdAtMs, senderId: msg.senderId, ...msg };
    groupedMessages.push(item);
    prevMsg = item;
  });
  const formatTime = (timestamp) => timestamp ? dayjs(timestamp.toDate?.() || timestamp).format("HH:mm") : "";
  const formatDate = (dateStr) => {
    const date = dayjs(dateStr);
    const today = dayjs();
    if (date.isSame(today, "day")) return "Bugün";
    if (date.isSame(today.subtract(1, "day"), "day")) return "Dün";
    return date.format("D MMMM YYYY");
  };

  // ── Route states ─────────────────────────────────────────────────────────
  if (authLoading || !user || loading) return <div className="flex min-h-dvh items-center justify-center bg-bg" role="status" aria-label="Yükleniyor"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" /></div>;
  return <ComingSoon />;

  return chatData ? <ChatView chatData={chatData} friendProfile={friendProfile} messages={messages} groupedMessages={groupedMessages} user={user} isSeen={!chatData.unreadBy || !chatData.unreadBy.includes(chatData.participants.find((participant) => participant !== user.uid))} newMessage={newMessage} sending={sending} messagesEndRef={messagesEndRef} inputRef={inputRef} onBack={() => router.push("/messages")} onSend={handleSend} onMessageChange={(event) => setNewMessage(event.target.value)} formatTime={formatTime} formatDate={formatDate} /> : <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg p-4 text-muted"><p className="text-sm">Sohbet bulunamadı.</p><Link href="/messages" className="rounded-[var(--radius-md)] border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Geri Dön</Link></div>;
}
