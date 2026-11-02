type Ref = { path: string; kind: "collection" | "document"; filters?: Filter[]; order?: string; direction?: "asc" | "desc" };
type Filter = { field: string; op: string; value: unknown };
type Constraint = { kind: "where"; filter: Filter } | { kind: "order"; field: string; direction: "asc" | "desc" };
type DocRecord = { id: string; data: Record<string, any> };

const API = "/api/data";
const COLLECTION_POLL_MS = 4000;
const REQUEST_CACHE_MS = 1200;
const inFlightReads = new Map<string, Promise<unknown>>();
const recentReads = new Map<string, { expiresAt: number; value: unknown }>();

function makeUrl(ref: Ref) {
  const params = new URLSearchParams({ path: ref.path });
  if (ref.kind === "collection") params.set("collection", "1");
  if (ref.filters?.length) params.set("where", JSON.stringify(ref.filters));
  if (ref.order) {
    params.set("order", ref.order);
    params.set("direction", ref.direction || "asc");
  }
  return `${API}?${params}`;
}

async function request(url: string, init?: RequestInit) {
  const method = init?.method || "GET";
  if (method === "GET") {
    const cached = recentReads.get(url);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const pending = inFlightReads.get(url);
    if (pending) return pending;
  }
  const execute = async () => {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  if (!response.ok) throw new Error(`Database request failed (${response.status})`);
  return response.status === 204 ? null : response.json();
  };
  if (method !== "GET") {
    const value = await execute();
    recentReads.clear();
    return value;
  }
  const pending = execute().then((value) => {
    recentReads.set(url, { value, expiresAt: Date.now() + REQUEST_CACHE_MS });
    return value;
  }).finally(() => inFlightReads.delete(url));
  inFlightReads.set(url, pending);
  return pending;
}

export function collection(_db: unknown, ...segments: (string | Ref)[]): Ref {
  const first = segments[0];
  const path = typeof first === "object" ? [first.path, ...segments.slice(1)].join("/") : segments.join("/");
  return { path, kind: "collection" };
}

export function doc(_db: unknown, ...segments: (string | Ref)[]): Ref {
  const first = segments[0];
  const path = typeof first === "object" ? [first.path, ...segments.slice(1)].join("/") : segments.join("/");
  return { path, kind: "document" };
}

export function where(field: string, op: string, value: unknown): Constraint {
  return { kind: "where", filter: { field, op, value } };
}

export function orderBy(field: string, direction: "asc" | "desc" = "asc"): Constraint {
  return { kind: "order", field, direction };
}

export function query(ref: Ref, ...constraints: Constraint[]): Ref {
  return {
    ...ref,
    filters: constraints.filter((item): item is Extract<Constraint, { kind: "where" }> => item.kind === "where").map((item) => item.filter),
    ...constraints.find((item): item is Extract<Constraint, { kind: "order" }> => item.kind === "order") && {
      order: constraints.find((item): item is Extract<Constraint, { kind: "order" }> => item.kind === "order")!.field,
      direction: constraints.find((item): item is Extract<Constraint, { kind: "order" }> => item.kind === "order")!.direction,
    },
  };
}

function documentSnapshot(ref: Ref, row: DocRecord | null) {
  return {
    id: row?.id || ref.path.split("/").at(-1)!,
    ref,
    exists: () => Boolean(row),
    data: () => row?.data,
  };
}

function collectionSnapshot(ref: Ref, rows: DocRecord[]) {
  const docs = rows.map((row) => documentSnapshot({ path: `${ref.path}/${row.id}`, kind: "document" }, row));
  return { docs, size: docs.length, empty: docs.length === 0, forEach: (callback: (item: (typeof docs)[number]) => void) => docs.forEach(callback) };
}

export async function getDoc(ref: Ref) {
  const row = await request(makeUrl(ref)) as DocRecord | null;
  return documentSnapshot(ref, row);
}

export async function getDocs(ref: Ref) {
  const rows = await request(makeUrl({ ...ref, kind: "collection" })) as DocRecord[];
  return collectionSnapshot(ref, rows);
}

export function onSnapshot(ref: Ref, next: (snapshot: any) => void, error?: (error: unknown) => void) {
  let active = true;
  let previous = "";
  const read = async () => {
    try {
      let snapshot: any;
      let serialized: string;
      if (ref.kind === "document") {
        snapshot = await getDoc(ref);
        serialized = JSON.stringify({ exists: snapshot.exists(), data: snapshot.data() });
      } else {
        snapshot = await getDocs(ref);
        serialized = JSON.stringify(snapshot.docs.map((item: any) => ({ id: item.id, data: item.data() })));
      }
      if (active && serialized !== previous) {
        previous = serialized;
        next(snapshot);
      }
    } catch (cause) {
      if (active) error?.(cause);
    }
  };
  void read();
  const timer = setInterval(read, COLLECTION_POLL_MS);
  return () => { active = false; clearInterval(timer); };
}

export function setDoc(ref: Ref, data: Record<string, any>, options?: { merge?: boolean }) {
  return request(API, { method: "POST", body: JSON.stringify({ path: ref.path, data, merge: options?.merge }) });
}

export function updateDoc(ref: Ref, data: Record<string, any>) {
  return request(API, { method: "PATCH", body: JSON.stringify({ path: ref.path, data }) });
}

export function deleteDoc(ref: Ref) {
  return request(`${API}?path=${encodeURIComponent(ref.path)}`, { method: "DELETE" });
}

export function addDoc(ref: Ref, data: Record<string, any>) {
  return setDoc(doc({}, ref, globalThis.crypto.randomUUID()), data);
}

export function serverTimestamp() { return new Date().toISOString(); }
export function arrayUnion(...values: unknown[]) { return { __op: "arrayUnion", values }; }
export function arrayRemove(...values: unknown[]) { return { __op: "arrayRemove", values }; }
export type Unsubscribe = () => void;
