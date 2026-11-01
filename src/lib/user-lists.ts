import { collection, deleteDoc, doc, getDoc, setDoc } from "@/lib/store-client";
import { db } from "@/lib/db-client";
import type { UserMovieState, UserList } from "@/types";

const LIST_ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const LIST_ID_LENGTH = 9;

export function generateListId(length: number = LIST_ID_LENGTH): string {
  const values = new Uint32Array(length);
  const cryptoApi = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(values);
  }

  return Array.from(values, (value) => {
    const randomValue = value || Math.floor(Math.random() * LIST_ID_ALPHABET.length ** 2);
    return LIST_ID_ALPHABET[randomValue % LIST_ID_ALPHABET.length];
  }).join("");
}

export const DEFAULT_LISTS: Record<string, UserList> = {
  wishlist: { id: "wishlist", name: "Wishlist", type: "default", visibility: "public", showOnHome: true },
  watched: { id: "watched", name: "Watched", type: "default", visibility: "private", showOnHome: false },
};

export function listRef(uid: string, listId: string) {
  return doc(db, "users", uid, "lists", listId);
}

export function listMoviesRef(uid: string, listId: string) {
  return collection(db, "users", uid, "lists", listId, "movies");
}

export function listMovieRef(uid: string, listId: string, movieId: string | number) {
  return doc(db, "users", uid, "lists", listId, "movies", String(movieId));
}

export function watchLogRef(uid: string, movieId: string | number) {
  return doc(db, "users", uid, "watchLog", String(movieId));
}

export async function ensureDefaultLists(uid: string): Promise<void> {
  await Promise.all(Object.values(DEFAULT_LISTS).map((list) => setDoc(listRef(uid, list.id), list, { merge: true })));
}

export async function getUserMovieState(uid: string, movieId: string | number): Promise<UserMovieState | null> {
  const [wishlistSnap, watchLogSnap] = await Promise.all([
    getDoc(listMovieRef(uid, "wishlist", movieId)),
    getDoc(watchLogRef(uid, movieId)),
  ]);
  const wishlist = wishlistSnap.exists() ? wishlistSnap.data() : null;
  const watchLog = watchLogSnap.exists() ? watchLogSnap.data() : null;
  if (!wishlist && !watchLog?.isWatched) return null;
  return {
    ...(wishlist || {}),
    ...(watchLog || {}),
    id: String(movieId),
    status: watchLog?.isWatched ? "watched" : "wishlist",
    isWatched: Boolean(watchLog?.isWatched),
  };
}

export function saveWishlistMovie(uid: string, movieId: string | number, data: Record<string, any>) {
  return setDoc(listMovieRef(uid, "wishlist", movieId), { movieId: String(movieId), ...data }, { merge: true });
}

export function saveWatchedMovie(uid: string, movieId: string | number, data: Record<string, any>) {
  return setDoc(listMovieRef(uid, "watched", movieId), { movieId: String(movieId), ...data }, { merge: true });
}

export function saveWatchLog(uid: string, movieId: string | number, data: Record<string, any>) {
  return setDoc(watchLogRef(uid, movieId), { movieId: String(movieId), ...data }, { merge: true });
}

export function removeWishlistMovie(uid: string, movieId: string | number) {
  return deleteDoc(listMovieRef(uid, "wishlist", movieId));
}

export function removeWatchedMovie(uid: string, movieId: string | number) {
  return deleteDoc(listMovieRef(uid, "watched", movieId));
}

export function removeWatchLog(uid: string, movieId: string | number) {
  return deleteDoc(watchLogRef(uid, movieId));
}
