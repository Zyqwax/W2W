import { and, asc, desc, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appDocument } from "@/lib/db/schema";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
type Filter = { field: string; op: string; value: unknown };

function cleanPath(value: string | null) {
  const parts = (value || "").split("/").filter(Boolean);
  if (!parts.length || parts.some((part) => part === "." || part === "..")) throw new Error("Invalid path");
  return parts.join("/");
}

function parseFilters(request: NextRequest): Filter[] {
  const raw = request.nextUrl.searchParams.get("where");
  return raw ? JSON.parse(raw) : [];
}

async function sessionFor(request: NextRequest): Promise<Session> {
  return auth.api.getSession({ headers: request.headers });
}

async function canAccess(path: string, method: string, session: Session): Promise<boolean> {
  const parts = path.split("/");
  const uid = session?.user.id;
  const writing = method !== "GET";
  if (parts[0] === "movies") return method === "GET" || Boolean(uid);

  if (parts[0] === "users" && parts[1]) {
    const owner = uid === parts[1];
    if (writing) return owner;
    if (parts.length === 2 || parts[2] === "watchLog") return true;
    if (parts[2] === "friends") return owner;
    if (parts[2] === "lists") {
      if (owner) return true;
      const listId = parts[3];
      if (!listId) return true; // Collection results are filtered to public lists below.
      const listPath = `users/${parts[1]}/lists/${listId}`;
      const [list] = await db.select().from(appDocument).where(eq(appDocument.path, listPath)).limit(1);
      return list?.data?.visibility === "public";
    }
    return false;
  }

  if (parts[0] === "chats") {
    if (!uid || parts.length === 1) return !writing && Boolean(uid);
    const chatPath = `chats/${parts[1]}`;
    const [chat] = await db.select().from(appDocument).where(eq(appDocument.path, chatPath)).limit(1);
    if (!chat && writing && parts.length === 2) return true;
    const participants = Array.isArray(chat?.data?.participants) ? chat.data.participants : [];
    return participants.includes(uid);
  }

  return false;
}

function filterExpression(filter: Filter) {
  const value = JSON.stringify(filter.value);
  if (filter.op === "array-contains") return sql`${appDocument.data}->${filter.field} @> ${JSON.stringify([filter.value])}::jsonb`;
  if (filter.op === "==") return sql`${appDocument.data}->${filter.field} = ${value}::jsonb`;
  throw new Error("Unsupported filter");
}

async function getData(request: NextRequest) {
  const path = cleanPath(request.nextUrl.searchParams.get("path"));
  const isCollection = request.nextUrl.searchParams.get("collection") === "1";
  const session = await sessionFor(request);
  if (!(await canAccess(path, "GET", session))) return Response.json({ error: "Forbidden" }, { status: 403 });

  if (!isCollection) {
    const [row] = await db.select().from(appDocument).where(eq(appDocument.path, path)).limit(1);
    return Response.json(row ? { id: row.documentId, data: row.data } : null);
  }

  const filters = parseFilters(request);
  const conditions = [eq(appDocument.collectionPath, path), ...filters.map(filterExpression)];
  const parts = path.split("/");
  if (parts[0] === "chats" && session?.user.id) {
    conditions.push(sql`${appDocument.data}->'participants' @> ${JSON.stringify([session.user.id])}::jsonb`);
  }
  if (parts[0] === "users" && parts[2] === "lists" && parts[1] !== session?.user.id) {
    conditions.push(sql`${appDocument.data}->'visibility' = '"public"'::jsonb`);
  }

  const order = request.nextUrl.searchParams.get("order");
  const rows = await db.select().from(appDocument).where(and(...conditions)).orderBy(
    order ? (request.nextUrl.searchParams.get("direction") === "desc"
      ? desc(sql`${appDocument.data}->>${order}`)
      : asc(sql`${appDocument.data}->>${order}`)) : asc(appDocument.documentId),
  );
  return Response.json(rows.map((row) => ({ id: row.documentId, data: row.data })));
}

async function writeData(request: NextRequest, mode: "set" | "update") {
  const body = await request.json();
  const path = cleanPath(body.path);
  const session = await sessionFor(request);
  if (!session?.user || !(await canAccess(path, "POST", session))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const parts = path.split("/");
  if (parts[0] === "chats" && parts.length === 2) {
    const existing = await db.select().from(appDocument).where(eq(appDocument.path, path)).limit(1);
    const participants = body.data?.participants;
    if (!existing.length && !participants?.includes(session.user.id)) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (existing.length && !(existing[0].data.participants as string[] | undefined)?.includes(session.user.id)) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (existing.length && body.data?.participants !== undefined) return Response.json({ error: "Participants are immutable" }, { status: 400 });
  }
  if (parts[0] === "chats" && parts[2] === "messages" && body.data?.senderId !== session.user.id) {
    return Response.json({ error: "Sender must match the session user" }, { status: 403 });
  }

  const [current] = await db.select().from(appDocument).where(eq(appDocument.path, path)).limit(1);
  const nextData = mode === "update" || body.merge ? { ...(current?.data || {}), ...body.data } : body.data;
  for (const [key, value] of Object.entries(nextData)) {
    if (value && typeof value === "object" && "__op" in value) {
      const currentValue = Array.isArray(current?.data[key]) ? current.data[key] as unknown[] : [];
      const values = Array.isArray((value as any).values) ? (value as any).values : [];
      nextData[key] = (value as any).__op === "arrayUnion"
        ? [...currentValue, ...values.filter((item: unknown) => !currentValue.some((old) => JSON.stringify(old) === JSON.stringify(item)))]
        : currentValue.filter((item) => !values.some((remove: unknown) => JSON.stringify(remove) === JSON.stringify(item)));
    }
  }
  const parent = parts.slice(0, -1).join("/");
  const [row] = await db.insert(appDocument).values({ path, collectionPath: parent, documentId: parts.at(-1)!, data: nextData })
    .onConflictDoUpdate({ target: appDocument.path, set: { data: nextData, updatedAt: new Date() } }).returning();
  return Response.json({ id: row.documentId, data: row.data });
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
    await db.delete(appDocument).where(eq(appDocument.path, path));
    return new Response(null, { status: 204 });
  } catch (error) { console.error("Data delete failed:", error); return Response.json({ error: "Invalid request" }, { status: 400 }); }
}
