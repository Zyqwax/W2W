"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, updateDoc, serverTimestamp } from "@/lib/store-client";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db-client";
import { useAuth } from "@/context/AuthContext";
import { ensureDefaultLists, generateListId } from "@/lib/user-lists";
import { translate } from "@/lib/i18n";
import ListGrid from "@/components/pages/lists/ListGrid";
import NewListButton from "@/components/pages/lists/NewListButton";
import PageLoading from "@/components/ui/PageLoading";
import Skeleton from "@/components/ui/Skeleton";

export default function ListsPage() {
  const { user, loading: authLoading, language } = useAuth();
  const router = useRouter();
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);
  const [lists, setLists] = useState([]);
  const [listMovies, setListMovies] = useState({});
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [listsLoaded, setListsLoaded] = useState(false);
  const [loadedListIds, setLoadedListIds] = useState<string[]>([]);
  const [tvLists, setTvLists] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!user || !lists.length) return;
    let active = true;
    const library = fetch("/api/tv?action=library").then(r => { if (!r.ok) throw Error(); return r.json(); });
    Promise.all(lists.map(async (list) => {
      const isDefault = list.id === "wishlist" || list.id === "watched";
      const rows = isDefault ? await library : await fetch(`/api/tv?action=list&listId=${encodeURIComponent(list.id)}`).then(r => { if (!r.ok) throw Error(); return r.json(); });
      const selected = isDefault ? rows.filter((row) => row.state.status === (list.id === "wishlist" ? "watchlist" : "completed")) : rows;
      return [list.id, selected.map((row) => ({ ...row.series, id: `tv_${row.series.id}` }))] as const;
    })).then((entries) => { if (active) setTvLists(Object.fromEntries(entries)); }).catch(() => {});
    return () => { active = false; };
  }, [user, lists]);

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
        setLoadedListIds([]);
        // Default lists are created asynchronously on first visit; don't flash the
        // empty state if the first poll wins that race.
        if (nextLists.length > 0) setListsLoaded(true);

        nextLists.forEach((list) => {
          const unsubscribeMovies = onSnapshot(
            collection(db, "users", user.uid, "lists", list.id, "movies"),
            (movieSnapshot) => {
              const movies = movieSnapshot.docs.map((movieDoc) => ({ id: movieDoc.id, ...movieDoc.data() }));
              setListMovies((current) => ({ ...current, [list.id]: movies }));
              setLoadedListIds((current) => current.includes(list.id) ? current : [...current, list.id]);
            },
            () => {
              setListMovies((current) => ({ ...current, [list.id]: [] }));
              setLoadedListIds((current) => current.includes(list.id) ? current : [...current, list.id]);
            },
          );
          movieUnsubscribers.set(list.id, unsubscribeMovies);
        });
      },
      () => {
        setLists([]);
        setListMovies({});
        setListsLoaded(true);
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
    if (!listName || !user) return false;
    const formData = new FormData(event.currentTarget);
    const visibility = formData.get("visibility") === "private" ? "private" : "public";
    setCreating(true);
    const id = generateListId();
    try {
      await setDoc(doc(db, "users", user.uid, "lists", id), { id, name: listName, type: "custom", visibility, showOnHome: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), schemaVersion: 1 });
      setName("");
      setCreateError(false);
      return true;
    } catch (error) {
      console.error("List creation error:", error);
      setCreateError(true);
      return false;
    } finally {
      setCreating(false);
    }
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
    <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold text-accent">{t("lists.eyebrow")}</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-text md:text-4xl">{t("lists.title")}</h1><p className="mt-2 text-sm text-muted">{language === "en" ? "Your saved films, organized your way." : "Kaydettiğin filmler, kendi düzenin."}</p>
      </header>
      {createError && <p role="alert" className="mb-5 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">{language === "en" ? "The list could not be created. Try again." : "Liste oluşturulamadı. Yeniden dene."}</p>}
      {!listsLoaded ? <div className="space-y-10" aria-label={language === "tr" ? "Listeler yükleniyor" : "Loading lists"} aria-busy="true">{[0, 1].map((section) => <section key={section}><Skeleton className="mb-3" width="11rem" height="1.5rem" /><Skeleton className="mb-5" width="16rem" height="1rem" /><div className="grid gap-4 sm:grid-cols-2">{[0, 1].map((card) => <Skeleton key={card} className="rounded-2xl" width="100%" height="12rem" />)}</div></section>)}</div> : <ListGrid
        lists={lists}
        listMovies={Object.fromEntries(lists.map((list) => [list.id, [...(listMovies[list.id] || []), ...(tvLists[list.id] || [])]]))}
        loadedListIds={loadedListIds}
        t={t}
        editingId={editingId}
        editingName={editingName}
        onEditStart={(list) => { setEditingId(list.id); setEditingName(list.name); }}
        onEditingNameChange={setEditingName}
        onSave={saveList}
        onVisibilityChange={changeVisibility}
        onDelete={deleteList}
        newListButton={<NewListButton name={name} creating={creating} onNameChange={(value) => { setName(value); setCreateError(false); }} onSubmit={createList} t={t} />}
      />}
    </div>
  );
}
