import { NextRequest } from "next/server";
import { and, eq, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  tvSeries,
  userTvSeries,
  userTvEpisodes,
  listTvSeries,
  lists,
} from "@/lib/db/schema";

import { tmdbTv, airedCatalog } from "@/lib/tmdb-tv";
import { isAired, progressFor, type TvSeason } from "@/lib/tv";

const statuses = ["watchlist", "watching", "completed", "on_hold", "dropped"];
const validId = (id: unknown): id is string =>
  typeof id === "string" && /^\d{1,12}$/.test(id);

async function session(request: NextRequest) {
  return auth.api.getSession({ headers: request.headers });
}

export async function GET(request: NextRequest) {
  const current = await session(request);
  if (!current)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const params = request.nextUrl.searchParams;
  const action = params.get("action");
  if (action === "library") {
    const rows = await db
      .select({ series: tvSeries, state: userTvSeries })
      .from(userTvSeries)
      .innerJoin(tvSeries, eq(tvSeries.id, userTvSeries.seriesId))
      .where(eq(userTvSeries.userId, current.user.id));
    const marks = await db
      .select({ seriesId: userTvEpisodes.seriesId, total: count() })
      .from(userTvEpisodes)
      .where(eq(userTvEpisodes.userId, current.user.id))
      .groupBy(userTvEpisodes.seriesId);
    return Response.json(
      rows.map((row) => ({
        ...row,
        watchedCount:
          marks.find((m) => m.seriesId === row.series.id)?.total || 0,
      })),
    );
  }
  if (action === "progress") {
    const id = params.get("id");
    if (!validId(id))
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    try {
      const episodes = await airedCatalog(id, params.get("language") || "tr");
      const marks = await db
        .select()
        .from(userTvEpisodes)
        .where(
          and(
            eq(userTvEpisodes.userId, current.user.id),
            eq(userTvEpisodes.seriesId, id),
          ),
        );
      return Response.json(progressFor(episodes, marks));
    } catch {
      return Response.json({ error: "Progress unavailable" }, { status: 502 });
    }
  }
  if (action === "state") {
    const id = params.get("id");
    if (!validId(id))
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    const [state] = await db
      .select()
      .from(userTvSeries)
      .where(
        and(
          eq(userTvSeries.userId, current.user.id),
          eq(userTvSeries.seriesId, id),
        ),
      );
    const episodes = await db
      .select()
      .from(userTvEpisodes)
      .where(
        and(
          eq(userTvEpisodes.userId, current.user.id),
          eq(userTvEpisodes.seriesId, id),
        ),
      );
    const memberships = await db
      .select()
      .from(listTvSeries)
      .where(
        and(
          eq(listTvSeries.userId, current.user.id),
          eq(listTvSeries.seriesId, id),
        ),
      );
    return Response.json({ state: state || null, episodes, memberships });
  }
  if (action === "list") {
    const listId = params.get("listId");
    const ownerId = params.get("ownerId") || current.user.id;
    if (!listId || ownerId.length > 200 || listId.length > 200)
      return Response.json({ error: "Invalid list" }, { status: 400 });
    const [list] = await db
      .select()
      .from(lists)
      .where(and(eq(lists.userId, ownerId), eq(lists.id, listId)));
    if (!list || (ownerId !== current.user.id && list.visibility !== "public"))
      return Response.json({ error: "List not found" }, { status: 404 });
    if (listId === "wishlist" || listId === "watched") {
      const rows = await db.select({series: tvSeries, state: userTvSeries}).from(userTvSeries).innerJoin(tvSeries, eq(tvSeries.id,userTvSeries.seriesId)).where(and(eq(userTvSeries.userId,ownerId),eq(userTvSeries.status,listId === "wishlist" ? "watchlist" : "completed")));
      return Response.json(rows);
    }
    const rows = await db
      .select({ series: tvSeries, addedAt: listTvSeries.addedAt })
      .from(listTvSeries)
      .innerJoin(tvSeries, eq(tvSeries.id, listTvSeries.seriesId))
      .where(
        and(eq(listTvSeries.userId, ownerId), eq(listTvSeries.listId, listId)),
      );
    return Response.json(rows);
  }
  const id = params.get("id");
  const season = params.get("season");
  const query = params.get("q")?.trim();
  let path: string;
  if (action === "search" && query && query.length <= 200)
    path = `/search/tv?query=${encodeURIComponent(query)}`;
  else if (action === "detail" && validId(id))
    path = `/tv/${id}?append_to_response=credits,videos,watch/providers`;
  else if (
    action === "season" &&
    validId(id) &&
    season !== null &&
    /^\d{1,3}$/.test(season)
  )
    path = `/tv/${id}/season/${season}?`;
  else return Response.json({ error: "Invalid request" }, { status: 400 });
  try {
    return Response.json(
      await tmdbTv(path.replace(/\?$/, ""), params.get("language") || "tr"),
    );
  } catch {
    return Response.json({ error: "TMDB unavailable" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const current = await session(request);
  if (!current)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: {
    action?: string;
    id?: string;
    status?: string;
    name?: string;
    posterPath?: string;
    season?: number;
    episode?: number;
    episodeNumbers?: number[];
    watched?: boolean;
    listId?: string;
    add?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return Response.json({ error: "Invalid data" }, { status: 400 });
  const { action, id } = body;
  if (!validId(id))
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  const uid = current.user.id;
  if (action === "remove") {
    await db
      .delete(userTvSeries)
      .where(and(eq(userTvSeries.userId, uid), eq(userTvSeries.seriesId, id)));
  } else if (action === "status") {
    if (
      !statuses.includes(body.status) ||
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.length > 500 ||
      (body.posterPath != null &&
        (typeof body.posterPath !== "string" || body.posterPath.length > 500))
    )
      return Response.json({ error: "Invalid data" }, { status: 400 });
    await db.transaction(async (tx) => {
      await tx
        .insert(tvSeries)
        .values({ id, name: body.name, posterPath: body.posterPath || null })
        .onConflictDoUpdate({
          target: tvSeries.id,
          set: {
            name: body.name,
            posterPath: body.posterPath || null,
            updatedAt: new Date(),
          },
        });
      await tx
        .insert(userTvSeries)
        .values({ userId: uid, seriesId: id, status: body.status })
        .onConflictDoUpdate({
          target: [userTvSeries.userId, userTvSeries.seriesId],
          set: { status: body.status, updatedAt: new Date() },
        });
    });
  } else if (action === "season") {
    const { season, episodeNumbers, watched } = body;
    if (
      !Number.isInteger(season) ||
      season < 0 ||
      season > 999 ||
      !Array.isArray(episodeNumbers) ||
      episodeNumbers.length > 1000 ||
      episodeNumbers.some(
        (n: unknown) =>
          !Number.isInteger(n) || Number(n) < 1 || Number(n) > 9999,
      ) ||
      typeof watched !== "boolean"
    )
      return Response.json({ error: "Invalid season" }, { status: 400 });
    const [state] = await db
      .select()
      .from(userTvSeries)
      .where(and(eq(userTvSeries.userId, uid), eq(userTvSeries.seriesId, id)));
    if (!state)
      return Response.json({ error: "Series is not tracked" }, { status: 409 });
    const numbers = [...new Set<number>(episodeNumbers)];
    if (watched) {
      try {
        const catalog = await tmdbTv<TvSeason>(`/tv/${id}/season/${season}`);
        const allowed = new Set(
          (catalog.episodes || [])
            .filter((e) => isAired(e))
            .map((e) => e.episode_number),
        );
        if (numbers.some((n) => !allowed.has(n)))
          return Response.json(
            { error: "Episode has not aired" },
            { status: 400 },
          );
      } catch {
        return Response.json(
          { error: "Could not validate season" },
          { status: 502 },
        );
      }
    }
    await db.transaction(async (tx) => {
      for (const episodeNumber of numbers) {
        if (watched)
          await tx
            .insert(userTvEpisodes)
            .values({
              userId: uid,
              seriesId: id,
              seasonNumber: season,
              episodeNumber,
            })
            .onConflictDoNothing();
        else
          await tx
            .delete(userTvEpisodes)
            .where(
              and(
                eq(userTvEpisodes.userId, uid),
                eq(userTvEpisodes.seriesId, id),
                eq(userTvEpisodes.seasonNumber, season),
                eq(userTvEpisodes.episodeNumber, episodeNumber),
              ),
            );
      }
    });
  } else if (action === "episode") {
    const { season, episode, watched } = body;
    if (
      !Number.isInteger(season) ||
      season < 0 ||
      season > 999 ||
      !Number.isInteger(episode) ||
      episode < 1 ||
      episode > 9999 ||
      typeof watched !== "boolean"
    )
      return Response.json({ error: "Invalid episode" }, { status: 400 });
    const [state] = await db
      .select()
      .from(userTvSeries)
      .where(and(eq(userTvSeries.userId, uid), eq(userTvSeries.seriesId, id)));
    if (!state)
      return Response.json({ error: "Series is not tracked" }, { status: 409 });
    if (watched) {
      try {
        const catalog = await tmdbTv<TvSeason>(`/tv/${id}/season/${season}`);
        if (
          !catalog.episodes?.some(
            (e) => e.episode_number === episode && isAired(e),
          )
        )
          return Response.json(
            { error: "Episode has not aired" },
            { status: 400 },
          );
      } catch {
        return Response.json(
          { error: "Could not validate episode" },
          { status: 502 },
        );
      }
    }
    if (watched)
      await db
        .insert(userTvEpisodes)
        .values({
          userId: uid,
          seriesId: id,
          seasonNumber: season,
          episodeNumber: episode,
        })
        .onConflictDoNothing();
    else
      await db
        .delete(userTvEpisodes)
        .where(
          and(
            eq(userTvEpisodes.userId, uid),
            eq(userTvEpisodes.seriesId, id),
            eq(userTvEpisodes.seasonNumber, season),
            eq(userTvEpisodes.episodeNumber, episode),
          ),
        );
  } else if (action === "list") {
    if (typeof body.listId !== "string" || typeof body.add !== "boolean")
      return Response.json({ error: "Invalid list" }, { status: 400 });
    const [list] = await db
      .select()
      .from(lists)
      .where(
        and(
          eq(lists.userId, uid),
          eq(lists.id, body.listId),
          eq(lists.type, "custom"),
        ),
      );
    if (!list)
      return Response.json({ error: "List not found" }, { status: 404 });
    if (body.add) {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.length > 500 ||
        (body.posterPath != null &&
          (typeof body.posterPath !== "string" || body.posterPath.length > 500))
      )
        return Response.json({ error: "Invalid data" }, { status: 400 });
      await db.transaction(async (tx) => {
        await tx
          .insert(tvSeries)
          .values({ id, name: body.name, posterPath: body.posterPath || null })
          .onConflictDoNothing();
        await tx
          .insert(listTvSeries)
          .values({ userId: uid, listId: body.listId, seriesId: id })
          .onConflictDoNothing();
      });
    } else
      await db
        .delete(listTvSeries)
        .where(
          and(
            eq(listTvSeries.userId, uid),
            eq(listTvSeries.listId, body.listId),
            eq(listTvSeries.seriesId, id),
          ),
        );
  } else return Response.json({ error: "Invalid action" }, { status: 400 });
  return Response.json({ ok: true });
}
