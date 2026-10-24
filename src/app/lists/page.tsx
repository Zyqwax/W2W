"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ensureDefaultLists, generateListId } from "@/lib/user-lists";
import { translate } from "@/lib/i18n";
import ListGrid from "@/components/pages/lists/ListGrid";
import NewListButton from "@/components/pages/lists/NewListButton";
import PageLoading from "@/components/ui/PageLoading";

export default function ListsPage() {
  const { user, loading: authLoading, language } = useAuth();
  const router = useRouter();
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);
  const [lists, setLists] = useState([]);
  const [listMovies, setListMovies] = useState({});
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user) return undefined;
    ensureDefaultLists(user.uid).catch((error) => console.error("Default lists error:", error));

    let movieUnsubscribers = new Map();
    const unsubscribeLists = onSnapshot(
      collection(db, "users", user.uid, "lists"),
      (snapshot) => {
        const nextLists = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() } as any))
          .sort((a, b) => (a.id === "wishlist" ? -1 : b.id === "wishlist" ? 1 : a.id === "watched" ? -1 : b.id === "watched" ? 1 : (a.name || "").localeCompare(b.name || "")));
        setLists(nextLists);
        movieUnsubscribers.forEach((unsubscribe) => unsubscribe());
        movieUnsubscribers = new Map();
        setListMovies({});

        nextLists.forEach((list) => {
          const unsubscribeMovies = onSnapshot(
            collection(db, "users", user.uid, "lists", list.id, "movies"),
            (movieSnapshot) => {
              const movies = movieSnapshot.docs.map((movieDoc) => ({ id: movieDoc.id, ...movieDoc.data() }));
              setListMovies((current) => ({ ...current, [list.id]: movies }));
            },
            () => setListMovies((current) => ({ ...current, [list.id]: [] })),
          );
          movieUnsubscribers.set(list.id, unsubscribeMovies);
        });
      },
      () => {
        setLists([]);
        setListMovies({});
      },
    );

    return () => {
      unsubscribeLists();
      movieUnsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user]);

  const createList = async (event) => {
    event.preventDefault();
    const listName = name.trim();
    if (!listName || !user) return;
    setCreating(true);
    const id = generateListId();
    await setDoc(doc(db, "users", user.uid, "lists", id), { id, name: listName, type: "custom", visibility: "public", showOnHome: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), schemaVersion: 1 });
    setName("");
    setCreating(false);
  };

  const saveList = async (list) => {
    if (!editingName.trim()) return;
    await updateDoc(doc(db, "users", user.uid, "lists", list.id), { name: editingName.trim(), updatedAt: serverTimestamp() });
    setEditingId(null);
  };

  const deleteList = async (list) => {
    if (!user || list.id === "wishlist" || list.id === "watched") return;
    const confirmMessage = language === "tr"
      ? `"${list.name}" listesini silmek istediğinizden emin misiniz?`
      : `Are you sure you want to delete the list "${list.name}"?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const moviesSnap = await getDocs(collection(db, "users", user.uid, "lists", list.id, "movies"));
      await Promise.all(moviesSnap.docs.map((movieDoc) => deleteDoc(movieDoc.ref)));
      await deleteDoc(doc(db, "users", user.uid, "lists", list.id));
    } catch (err) {
      console.error("List deletion error:", err);
    }
  };

  const changeVisibility = (list, visibility) => updateDoc(doc(db, "users", user.uid, "lists", list.id), { visibility, updatedAt: serverTimestamp() });

  if (authLoading || !user) return <PageLoading />;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pt-10">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div><p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-muted">{t("lists.eyebrow")}</p><h1 className="font-syne text-2xl font-semibold text-text md:text-3xl">{t("lists.title")}</h1></div>
      </header>
      <ListGrid
        lists={lists}
        listMovies={listMovies}
        t={t}
        editingId={editingId}
        editingName={editingName}
        onEditStart={(list) => { setEditingId(list.id); setEditingName(list.name); }}
        onEditingNameChange={setEditingName}
        onSave={saveList}
        onVisibilityChange={changeVisibility}
        onDelete={deleteList}
        newListButton={<NewListButton name={name} creating={creating} onNameChange={setName} onSubmit={createList} t={t} />}
      />
    </div>
  );
}
