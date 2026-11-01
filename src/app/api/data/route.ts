import { and, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  chats,
  friends,
  listMovies,
  lists,
  messages,
  movieLocalizations,
  movieProviders,
  movies,
  user,
  watchLogs,
  wishlist,
} from "@/lib/db/schema";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
type Filter = { field: string; op: string; value: unknown };
type DocRecord = { id: string; data: Record<string, any> };

function cleanPath(value: string | null) {
  const parts = (value || "").split("/").filter(Boolean);
  if (!parts.length || parts.some((part) => part === "." || part === "..")) throw new Error("Invalid path");
  return parts.join("/");
}

function parseFilters(request: NextRequest): Filter[] {
  const raw = request.nextUrl.searchParams.get("where");
  return raw ? JSON.parse(raw) : [];
}

function asDate(value: unknown, fallback = new Date()): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string" && value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) return parsed;
  }
  return fallback;
}

async function sessionFor(request: NextRequest): Promise<Session> {
  return auth.api.getSession({ headers: request.headers });
}

async function readDocument(path: string): Promise<DocRecord | null> {
  const p = path.split("/");
  if (p[0] === "movies" && p.length === 2) {
    const [row] = await db.select().from(movies).where(eq(movies.id, p[1])).limit(1);
    return row ? { id: row.id, data: { ...row, id: row.id } } : null;
  }
  if (p[0] === "movies" && p.length === 4 && p[2] === "localizations") {
    const [row] = await db.select().from(movieLocalizations).where(and(eq(movieLocalizations.movieId, p[1]), eq(movieLocalizations.locale, p[3]))).limit(1);
    return row ? { id: p[3], data: { ...row, id: p[3] } } : null;
  }
  if (p[0] === "movies" && p.length === 4 && p[2] === "providers") {
    const [row] = await db.select().from(movieProviders).where(and(eq(movieProviders.movieId, p[1]), eq(movieProviders.region, p[3]))).limit(1);
    return row ? { id: p[3], data: { ...row, id: p[3] } } : null;
  }
  if (p[0] === "users" && p.length === 2) {
    const [row] = await db.select().from(user).where(eq(user.id, p[1])).limit(1);
    return row ? { id: row.id, data: { uid: row.id, displayName: row.name, photoURL: row.image, email: row.email, language: row.language, region: row.region, lastSeen: row.lastSeenAt } } : null;
  }
  if (p[0] === "users" && p[2] === "lists" && p.length === 4) {
    const [row] = await db.select().from(lists).where(and(eq(lists.userId, p[1]), eq(lists.id, p[3]))).limit(1);
    return row ? { id: row.id, data: { id: row.id, name: row.name, type: row.type, visibility: row.visibility, showOnHome: row.showOnHome, createdAt: row.createdAt, updatedAt: row.updatedAt } } : null;
  }
  if (p[0] === "users" && p[2] === "lists" && p.length === 6 && p[4] === "movies") {
    if (p[3] === "wishlist") {
      const [row] = await db.select().from(wishlist).where(and(eq(wishlist.userId, p[1]), eq(wishlist.movieId, p[5]))).limit(1);
      return row ? { id: p[5], data: { movieId: row.movieId, title: row.title, posterPath: row.posterPath, addedAt: row.addedAt } } : null;
    }
    const [row] = await db.select().from(listMovies).where(and(eq(listMovies.userId, p[1]), eq(listMovies.listId, p[3]), eq(listMovies.movieId, p[5]))).limit(1);
    return row ? { id: p[5], data: { movieId: row.movieId, title: row.title, posterPath: row.posterPath, addedAt: row.addedAt } } : null;
  }
  if (p[0] === "users" && p[2] === "watchLog" && p.length === 4) {
    const [row] = await db.select().from(watchLogs).where(and(eq(watchLogs.userId, p[1]), eq(watchLogs.movieId, p[3]))).limit(1);
    return row ? { id: row.movieId, data: { movieId: row.movieId, isWatched: row.isWatched, status: row.isWatched ? "watched" : undefined, watchedAt: row.watchedAt, watchHistory: row.watchHistory, rating: row.rating, review: row.review, updatedAt: row.updatedAt } } : null;
  }
  if (p[0] === "users" && p[2] === "friends" && p.length === 4) {
    const [row] = await db.select({ link: friends, profile: user }).from(friends)
      .innerJoin(user, eq(friends.friendUserId, user.id))
      .where(and(eq(friends.userId, p[1]), eq(friends.friendUserId, p[3]))).limit(1);
    return row ? { id: row.link.friendUserId, data: { uid: row.link.friendUserId, displayName: row.profile.name, photoURL: row.profile.image, addedAt: row.link.createdAt } } : null;
  }
  if (p[0] === "chats" && p.length === 2) {
    const [row] = await db.select().from(chats).where(eq(chats.id, p[1])).limit(1);
    return row ? { id: row.id, data: { ...row, id: row.id } } : null;
  }
  if (p[0] === "chats" && p[2] === "messages" && p.length === 4) {
    const [row] = await db.select().from(messages).where(and(eq(messages.chatId, p[1]), eq(messages.id, p[3]))).limit(1);
    return row ? { id: row.id, data: { ...row, id: row.id, senderId: row.senderId, movieId: row.movieId } } : null;
  }
  return null;
}

async function canAccess(path: string, method: string, session: Session): Promise<boolean> {
  const p = path.split("/");
  const uid = session?.user.id;
  const writing = method !== "GET";
  if (p[0] === "movies") return writing ? Boolean(uid) : true;
  if (p[0] === "users" && p[1]) {
    const owner = uid === p[1];
    if (writing) return owner;
    if (p.length === 2 || p[2] === "watchLog") return true;
    if (p[2] === "friends") return owner;
    if (p[2] === "lists") {
      if (owner) return true;
      if (p.length === 3) return true;
      const [list] = await db.select({ visibility: lists.visibility }).from(lists)
        .where(and(eq(lists.userId, p[1]), eq(lists.id, p[3]))).limit(1);
      return list?.visibility === "public";
    }
    return false;
  }
  if (p[0] === "chats") {
    if (!uid) return false;
    if (p.length === 1) return !writing;
    const chat = await readDocument(`chats/${p[1]}`);
    const participants = Array.isArray(chat?.data.participants) ? chat.data.participants : [];
    if (!chat && writing && p.length === 2) return true;
    return participants.includes(uid);
  }
  return false;
}

async function readCollection(path: string, session: Session): Promise<DocRecord[]> {
  const p = path.split("/");
  if (p[0] === "movies" && p.length === 1) {
    return (await db.select().from(movies)).map((row) => ({ id: row.id, data: { ...row, id: row.id } }));
  }
  if (p[0] === "movies" && p.length === 3 && p[2] === "localizations") {
    return (await db.select().from(movieLocalizations).where(eq(movieLocalizations.movieId, p[1]))).map((row) => ({ id: row.locale, data: { ...row, id: row.locale } }));
  }
  if (p[0] === "movies" && p.length === 3 && p[2] === "providers") {
    return (await db.select().from(movieProviders).where(eq(movieProviders.movieId, p[1]))).map((row) => ({ id: row.region, data: { ...row, id: row.region } }));
  }
  if (p[0] === "users" && p[2] === "lists" && p.length === 3) {
    const owner = p[1] === session?.user.id;
    const rows = await db.select().from(lists).where(owner ? eq(lists.userId, p[1]) : and(eq(lists.userId, p[1]), eq(lists.visibility, "public")));
    return rows.map((row) => ({ id: row.id, data: { id: row.id, name: row.name, type: row.type, visibility: row.visibility, showOnHome: row.showOnHome, createdAt: row.createdAt, updatedAt: row.updatedAt } }));
  }
  if (p[0] === "users" && p[2] === "lists" && p.length === 5 && p[4] === "movies") {
    if (p[3] === "wishlist") {
      return (await db.select().from(wishlist).where(eq(wishlist.userId, p[1]))).map((row) => ({ id: row.movieId, data: { movieId: row.movieId, title: row.title, posterPath: row.posterPath, addedAt: row.addedAt } }));
    }
    return (await db.select().from(listMovies).where(and(eq(listMovies.userId, p[1]), eq(listMovies.listId, p[3])))).map((row) => ({ id: row.movieId, data: { movieId: row.movieId, title: row.title, posterPath: row.posterPath, addedAt: row.addedAt } }));
  }
  if (p[0] === "users" && p[2] === "watchLog" && p.length === 3) {
    return (await db.select().from(watchLogs).where(eq(watchLogs.userId, p[1]))).map((row) => ({ id: row.movieId, data: { movieId: row.movieId, isWatched: row.isWatched, status: row.isWatched ? "watched" : undefined, watchedAt: row.watchedAt, watchHistory: row.watchHistory, rating: row.rating, review: row.review, updatedAt: row.updatedAt } }));
  }
  if (p[0] === "users" && p[2] === "friends" && p.length === 3) {
    const rows = await db.select({ link: friends, profile: user }).from(friends)
      .innerJoin(user, eq(friends.friendUserId, user.id)).where(eq(friends.userId, p[1]));
    return rows.map(({ link, profile }) => ({ id: link.friendUserId, data: { uid: link.friendUserId, displayName: profile.name, photoURL: profile.image, addedAt: link.createdAt } }));
  }
  if (p[0] === "chats" && p.length === 1) {
    if (!session?.user.id) return [];
    const rows = await db.select().from(chats).where(sql`${chats.participants} @> ${JSON.stringify([session.user.id])}::jsonb`);
    return rows.map((row) => ({ id: row.id, data: { ...row, id: row.id } }));
  }
  if (p[0] === "chats" && p[2] === "messages" && p.length === 3) {
    const rows = await db.select().from(messages).where(eq(messages.chatId, p[1]));
    return rows.map((row) => ({ id: row.id, data: { ...row, id: row.id, senderId: row.senderId, movieId: row.movieId } }));
  }
  return [];
}

function filterAndOrder(rows: DocRecord[], request: NextRequest) {
  const filters = parseFilters(request);
  const filtered = rows.filter(({ data }) => filters.every((filter) => {
    if (filter.op === "array-contains") return Array.isArray(data[filter.field]) && data[filter.field].includes(filter.value);
    if (filter.op === "==") return data[filter.field] === filter.value;
    throw new Error("Unsupported filter");
  }));
  const order = request.nextUrl.searchParams.get("order");
  if (order) {
    const direction = request.nextUrl.searchParams.get("direction") === "desc" ? -1 : 1;
    filtered.sort((a, b) => {
      const av = a.data[order] instanceof Date ? a.data[order].getTime() : a.data[order];
      const bv = b.data[order] instanceof Date ? b.data[order].getTime() : b.data[order];
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * direction;
      if (bv == null) return 1 * direction;
      return (av < bv ? -1 : av > bv ? 1 : 0) * direction;
    });
  } else filtered.sort((a, b) => a.id.localeCompare(b.id));
  return filtered;
}

async function getData(request: NextRequest) {
  const path = cleanPath(request.nextUrl.searchParams.get("path"));
  const isCollection = request.nextUrl.searchParams.get("collection") === "1";
  const session = await sessionFor(request);
  if (!(await canAccess(path, "GET", session))) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (!isCollection) return Response.json(await readDocument(path));
  return Response.json(filterAndOrder(await readCollection(path, session), request));
}

function expandArrayOperations(data: Record<string, any>, current: Record<string, any>) {
  const next = { ...data };
  for (const [key, value] of Object.entries(next)) {
    if (!value || typeof value !== "object" || !("__op" in value)) continue;
    const currentValue = Array.isArray(current[key]) ? current[key] : [];
    const values = Array.isArray(value.values) ? value.values : [];
    next[key] = value.__op === "arrayUnion"
      ? [...currentValue, ...values.filter((item: unknown) => !currentValue.some((old: unknown) => JSON.stringify(old) === JSON.stringify(item)))]
      : currentValue.filter((item: unknown) => !values.some((remove: unknown) => JSON.stringify(remove) === JSON.stringify(item)));
  }
  return next;
}

function numeric(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function writeDocument(path: string, data: Record<string, any>) {
  const p = path.split("/");
  if (p[0] === "movies" && p.length === 2) {
    const values = { id: p[1], originalTitle: data.originalTitle ?? null, originalLanguage: data.originalLanguage ?? null, posterPath: data.posterPath ?? null, backdropPath: data.backdropPath ?? null, releaseDate: data.releaseDate ?? null, runtime: numeric(data.runtime), voteAverage: numeric(data.voteAverage), voteCount: numeric(data.voteCount), updatedAt: asDate(data.updatedAt) };
    const [row] = await db.insert(movies).values(values).onConflictDoUpdate({ target: movies.id, set: values }).returning();
    return { id: row.id, data: { ...row, id: row.id } };
  }
  if (p[0] === "movies" && p.length === 4 && p[2] === "localizations") {
    await db.insert(movies).values({ id: p[1] }).onConflictDoNothing();
    const values = { movieId: p[1], locale: p[3], title: data.title ?? null, overview: data.overview ?? null, tagline: data.tagline ?? null, genres: Array.isArray(data.genres) ? data.genres : [], trailer: data.trailer ?? null, cast: Array.isArray(data.cast) ? data.cast : [], updatedAt: asDate(data.updatedAt) };
    const [row] = await db.insert(movieLocalizations).values(values).onConflictDoUpdate({ target: [movieLocalizations.movieId, movieLocalizations.locale], set: values }).returning();
    return { id: p[3], data: { ...row, id: p[3] } };
  }
  if (p[0] === "movies" && p.length === 4 && p[2] === "providers") {
    await db.insert(movies).values({ id: p[1] }).onConflictDoNothing();
    const values = { movieId: p[1], region: p[3], link: data.link ?? null, flatrate: data.flatrate ?? [], free: data.free ?? [], ads: data.ads ?? [], rent: data.rent ?? [], buy: data.buy ?? [], updatedAt: asDate(data.updatedAt) };
    const [row] = await db.insert(movieProviders).values(values).onConflictDoUpdate({ target: [movieProviders.movieId, movieProviders.region], set: values }).returning();
    return { id: p[3], data: { ...row, id: p[3] } };
  }
  if (p[0] === "users" && p.length === 2) {
    const values: Record<string, any> = { updatedAt: new Date() };
    if (data.displayName !== undefined) values.name = data.displayName;
    if (data.photoURL !== undefined) values.image = data.photoURL;
    if (data.language !== undefined) values.language = data.language;
    if (data.region !== undefined) values.region = data.region;
    if (data.lastSeen !== undefined) values.lastSeenAt = asDate(data.lastSeen);
    const [row] = await db.update(user).set(values).where(eq(user.id, p[1])).returning();
    return row ? { id: row.id, data: { uid: row.id, displayName: row.name, photoURL: row.image, email: row.email, language: row.language, region: row.region, lastSeen: row.lastSeenAt } } : null;
  }
  if (p[0] === "users" && p[2] === "lists" && p.length === 4) {
    const values = { id: p[3], userId: p[1], name: data.name ?? p[3], type: data.type ?? "custom", visibility: data.visibility ?? "private", showOnHome: Boolean(data.showOnHome), createdAt: asDate(data.createdAt), updatedAt: asDate(data.updatedAt) };
    const [row] = await db.insert(lists).values(values).onConflictDoUpdate({ target: [lists.userId, lists.id], set: values }).returning();
    return { id: row.id, data: { id: row.id, name: row.name, type: row.type, visibility: row.visibility, showOnHome: row.showOnHome, createdAt: row.createdAt, updatedAt: row.updatedAt } };
  }
  if (p[0] === "users" && p[2] === "lists" && p.length === 6 && p[4] === "movies") {
    await db.insert(movies).values({ id: p[5] }).onConflictDoNothing();
    const values = { userId: p[1], listId: p[3], movieId: p[5], title: data.title ?? null, posterPath: data.posterPath ?? null, addedAt: asDate(data.addedAt) };
    if (p[3] === "wishlist") {
      const [row] = await db.insert(wishlist).values({ userId: values.userId, movieId: values.movieId, title: values.title, posterPath: values.posterPath, addedAt: values.addedAt }).onConflictDoUpdate({ target: [wishlist.userId, wishlist.movieId], set: { title: values.title, posterPath: values.posterPath, addedAt: values.addedAt } }).returning();
      return { id: row.movieId, data: { movieId: row.movieId, title: row.title, posterPath: row.posterPath, addedAt: row.addedAt } };
    }
    const [row] = await db.insert(listMovies).values(values).onConflictDoUpdate({ target: [listMovies.userId, listMovies.listId, listMovies.movieId], set: { title: values.title, posterPath: values.posterPath, addedAt: values.addedAt } }).returning();
    return { id: row.movieId, data: { movieId: row.movieId, title: row.title, posterPath: row.posterPath, addedAt: row.addedAt } };
  }
  if (p[0] === "users" && p[2] === "watchLog" && p.length === 4) {
    await db.insert(movies).values({ id: p[3] }).onConflictDoNothing();
    const values = { userId: p[1], movieId: p[3], isWatched: Boolean(data.isWatched ?? data.status === "watched"), watchedAt: data.watchedAt ? asDate(data.watchedAt) : null, watchHistory: Array.isArray(data.watchHistory) ? data.watchHistory : [], rating: numeric(data.rating), review: data.review ?? null, updatedAt: asDate(data.updatedAt) };
    const [row] = await db.insert(watchLogs).values(values).onConflictDoUpdate({ target: [watchLogs.userId, watchLogs.movieId], set: values }).returning();
    return { id: row.movieId, data: { movieId: row.movieId, isWatched: row.isWatched, watchedAt: row.watchedAt, watchHistory: row.watchHistory, rating: row.rating, review: row.review, updatedAt: row.updatedAt } };
  }
  if (p[0] === "users" && p[2] === "friends" && p.length === 4) {
    const [row] = await db.insert(friends).values({ userId: p[1], friendUserId: p[3], createdAt: asDate(data.addedAt) }).onConflictDoUpdate({ target: [friends.userId, friends.friendUserId], set: { createdAt: asDate(data.addedAt) } }).returning();
    return { id: row.friendUserId, data: { uid: row.friendUserId, displayName: data.displayName, photoURL: data.photoURL, addedAt: row.createdAt } };
  }
  if (p[0] === "chats" && p.length === 2) {
    const values = { id: p[1], participants: Array.isArray(data.participants) ? data.participants : [], lastMessage: data.lastMessage ?? null, lastMessageAt: data.lastMessageAt ? asDate(data.lastMessageAt) : null, lastMessageSenderId: data.lastMessageSenderId || null, unreadBy: Array.isArray(data.unreadBy) ? data.unreadBy : [], updatedAt: new Date() };
    const [row] = await db.insert(chats).values(values).onConflictDoUpdate({ target: chats.id, set: { lastMessage: values.lastMessage, lastMessageAt: values.lastMessageAt, lastMessageSenderId: values.lastMessageSenderId, unreadBy: values.unreadBy, updatedAt: values.updatedAt } }).returning();
    return { id: row.id, data: { ...row, id: row.id } };
  }
  if (p[0] === "chats" && p[2] === "messages" && p.length === 4) {
    const values = { id: p[3], chatId: p[1], senderId: data.senderId, text: data.text ?? null, type: data.type ?? "text", movieId: data.movieId ? String(data.movieId) : null, movieTitle: data.movieTitle ?? null, moviePoster: data.moviePoster ?? null, createdAt: asDate(data.createdAt) };
    const [row] = await db.insert(messages).values(values).onConflictDoUpdate({ target: messages.id, set: values }).returning();
    return { id: row.id, data: { ...row, id: row.id } };
  }
  throw new Error(`Unsupported document path: ${path}`);
}

async function writeData(request: NextRequest, mode: "set" | "update") {
  const body = await request.json();
  const path = cleanPath(body.path);
  const session = await sessionFor(request);
  if (!session?.user || !(await canAccess(path, "POST", session))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const p = path.split("/");
  if (p[0] === "chats" && p.length === 2) {
    const current = await readDocument(path);
    if (!current && !body.data?.participants?.includes(session.user.id)) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (current && !current.data.participants?.includes(session.user.id)) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (current && body.data?.participants !== undefined) return Response.json({ error: "Participants are immutable" }, { status: 400 });
  }
  if (p[0] === "chats" && p[2] === "messages" && body.data?.senderId !== session.user.id) return Response.json({ error: "Sender must match the session user" }, { status: 403 });

  const current = await readDocument(path);
  const nextData = expandArrayOperations(mode === "update" || body.merge ? { ...(current?.data || {}), ...body.data } : body.data, current?.data || {});
  const row = await writeDocument(path, nextData);
  return Response.json(row);
}

export async function GET(request: NextRequest) {
  try { return await getData(request); }
  catch (error) { console.error("Data read failed:", error); return Response.json({ error: "Invalid request" }, { status: 400 }); }
}

export async function POST(request: NextRequest) {
  try { return await writeData(request, "set"); }
  catch (error) { console.error("Data write failed:", error); return Response.json({ error: "Invalid request" }, { status: 400 }); }
}

export async function PATCH(request: NextRequest) {
  try { return await writeData(request, "update"); }
  catch (error) { console.error("Data update failed:", error); return Response.json({ error: "Invalid request" }, { status: 400 }); }
}

export async function DELETE(request: NextRequest) {
  try {
    const path = cleanPath(request.nextUrl.searchParams.get("path"));
    const session = await sessionFor(request);
    if (!session?.user || !(await canAccess(path, "DELETE", session))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const p = path.split("/");
    if (p[0] === "users" && p[2] === "lists" && p.length === 4) await db.delete(lists).where(and(eq(lists.userId, p[1]), eq(lists.id, p[3])));
    else if (p[0] === "users" && p[2] === "lists" && p.length === 6 && p[4] === "movies") {
      if (p[3] === "wishlist") await db.delete(wishlist).where(and(eq(wishlist.userId, p[1]), eq(wishlist.movieId, p[5])));
      else await db.delete(listMovies).where(and(eq(listMovies.userId, p[1]), eq(listMovies.listId, p[3]), eq(listMovies.movieId, p[5])));
    } else if (p[0] === "users" && p[2] === "watchLog" && p.length === 4) await db.delete(watchLogs).where(and(eq(watchLogs.userId, p[1]), eq(watchLogs.movieId, p[3])));
    else if (p[0] === "users" && p[2] === "friends" && p.length === 4) await db.delete(friends).where(and(eq(friends.userId, p[1]), eq(friends.friendUserId, p[3])));
    else if (p[0] === "chats" && p[2] === "messages" && p.length === 4) await db.delete(messages).where(and(eq(messages.chatId, p[1]), eq(messages.id, p[3])));
    else if (p[0] === "chats" && p.length === 2) await db.delete(chats).where(eq(chats.id, p[1]));
    else return Response.json({ error: "Unsupported document path" }, { status: 400 });
    return new Response(null, { status: 204 });
  } catch (error) { console.error("Data delete failed:", error); return Response.json({ error: "Invalid request" }, { status: 400 }); }
}
