"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";
import ComingSoon from "@/components/ComingSoon";
import MessagesView from "@/components/pages/messages/MessagesView";

dayjs.extend(relativeTime);
dayjs.locale("tr");

// ── Controller ──────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const { friends } = useAppData();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [chatUsers, setChatUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const chatUsersRef = useRef({});

  // ── Authentication and realtime chat data ────────────────────────────────
  useEffect(() => {
    if (!authLoading && user === null) router.push("/login");
  }, [user, authLoading, router]);

  const fetchUserProfiles = useCallback(async (chatList: any[], existingUsers: Record<string, any>) => {
    const uids = new Set<string>();
    chatList.forEach((chat) => chat.participants?.forEach((participant: string) => {
      if (participant !== user?.uid) uids.add(participant);
    }));
    const newUsers: Record<string, any> = { ...existingUsers };
    const fetchPromises: Promise<any>[] = [];
    uids.forEach((uid: string) => {
      if (!newUsers[uid]) fetchPromises.push(getDoc(doc(db, "users", uid)).then((snap) => {
        if (snap.exists()) newUsers[uid] = snap.data();
      }));
    });
    if (fetchPromises.length > 0) await Promise.all(fetchPromises);
    return newUsers;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid), orderBy("lastMessageAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList = [];
      snapshot.forEach((item) => chatList.push({ id: item.id, ...item.data() }));
      setChats(chatList);
      const profiles = await fetchUserProfiles(chatList, chatUsersRef.current);
      chatUsersRef.current = profiles;
      setChatUsers(profiles);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, fetchUserProfiles]);

  // ── Chat actions ─────────────────────────────────────────────────────────
  const handleStartChatWithFriend = async (friendUid) => {
    if (modalLoading) return;
    setModalLoading(true);
    try {
      const chatId = [user.uid, friendUid].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) await setDoc(chatRef, { participants: [user.uid, friendUid].sort(), lastMessage: "", lastMessageAt: serverTimestamp(), lastMessageSenderId: "" });
      setIsModalOpen(false);
      router.push(`/messages/${chatId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Sohbet başlatılırken bir hata oluştu.");
    } finally {
      setModalLoading(false);
    }
  };

  // ── Derived presentation data ────────────────────────────────────────────
  const filteredFriends = friends.filter((friend) => friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase()));
  const formatChatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = dayjs(timestamp.toDate?.() || timestamp);
    const now = dayjs();
    if (date.isSame(now, "day")) return date.format("HH:mm");
    if (date.isSame(now.subtract(1, "day"), "day")) return "Dün";
    return date.format("D MMM");
  };

  // ── Route states ─────────────────────────────────────────────────────────
  if (authLoading || !user) return <div className="flex min-h-dvh items-center justify-center bg-bg" role="status" aria-label="Yükleniyor"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" /></div>;

  return <ComingSoon />;

  return <MessagesView chats={chats} chatUsers={chatUsers} loading={loading} user={user} friends={friends} filteredFriends={filteredFriends} isModalOpen={isModalOpen} modalLoading={modalLoading} searchQuery={searchQuery} onOpenModal={() => setIsModalOpen(true)} onCloseModal={() => setIsModalOpen(false)} onSearchChange={(event) => setSearchQuery(event.target.value)} onStartChat={handleStartChatWithFriend} formatChatTime={formatChatTime} />;
}
