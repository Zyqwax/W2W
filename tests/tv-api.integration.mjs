// Local integration test: creates two disposable users and removes its fixtures in finally.
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import pg from "pg";
const base = process.env.TV_TEST_URL || "http://localhost:3000";
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Run only against a local development server",
);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const ids = [randomUUID(), randomUUID()];
const tokens = [randomUUID(), randomUUID()];
const cookies = tokens.map(
  (token) =>
    `better-auth.session_token=${encodeURIComponent(`${token}.${createHmac("sha256", process.env.BETTER_AUTH_SECRET).update(token).digest("base64")}`)}`,
);
const seriesId = "5920";
const listId = randomUUID();
let original;
let catalogTouched = false;
async function request(path, body, index = 0) {
  const response = await fetch(`${base}/api/tv${path}`, {
    method: body ? "POST" : "GET",
    headers: { cookie: cookies[index], "content-type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}
let checks = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  checks++;
};
try {
  original = (
    await pool.query("select * from tv_series where id=$1", [seriesId])
  ).rows[0];
  for (let i = 0; i < 2; i++) {
    await pool.query('insert into "user" (id,name,email) values ($1,$2,$3)', [
      ids[i],
      "TV integration fixture",
      `${ids[i]}@example.invalid`,
    ]);
    await pool.query(
      "insert into session (id,token,user_id,expires_at) values ($1,$2,$3,now()+interval '1 hour')",
      [randomUUID(), tokens[i], ids[i]],
    );
  }
  check(
    (await fetch(`${base}/api/tv?action=library`)).status === 401,
    "unauthenticated library rejected",
  );
  check(
    (await request("?action=state&id=abc")).status === 400,
    "invalid IDs rejected",
  );
  check(
    (
      await request("", {
        id: seriesId,
        action: "status",
        status: "invalid",
        name: "Test",
      })
    ).status === 400,
    "invalid status rejected",
  );
  check((await request("", null)).status === 400, "missing action rejected");
  const detail = await request(`?action=detail&id=${seriesId}&language=tr`);
  check(
    detail.status === 200 && detail.data.seasons.length > 0,
    "TMDB detail works",
  );
  const show = detail.data;
  catalogTouched = true;
  check(
    (
      await request("", {
        id: seriesId,
        action: "status",
        status: "watching",
        name: show.name,
        posterPath: show.poster_path,
      })
    ).status === 200,
    "tracking created",
  );
  check(
    (await request("?action=state&id=" + seriesId)).data.state.status ===
      "watching",
    "status persisted",
  );
  check(
    (
      await request("", {
        id: seriesId,
        action: "episode",
        season: 1,
        episode: 9999,
        watched: true,
      })
    ).status === 400,
    "nonexistent episode rejected",
  );
  const mark = {
    id: seriesId,
    action: "episode",
    season: 1,
    episode: 1,
    watched: true,
  };
  check((await request("", mark)).status === 200, "episode marked");
  check((await request("", mark)).status === 200, "repeat mark succeeds");
  check(
    (await request("?action=state&id=" + seriesId)).data.episodes.length === 1,
    "repeat mark is idempotent",
  );
  const progress = await request(
    "?action=progress&id=" + seriesId + "&language=tr",
  );
  check(
    progress.status === 200 &&
      progress.data.watched === 1 &&
      progress.data.next.episode_number === 2,
    "progress and next episode correct",
  );
  check(
    (await request("?action=state&id=" + seriesId, null, 1)).data.state ===
      null,
    "second user cannot see tracking",
  );
  check(
    (await request("", { ...mark, watched: false })).status === 200,
    "undo works",
  );
  check(
    (await request("?action=state&id=" + seriesId)).data.episodes.length === 0,
    "undo persisted",
  );
  const bulk = {
    id: seriesId,
    action: "season",
    season: 1,
    episodeNumbers: [1, 2, 2],
    watched: true,
  };
  check((await request("", bulk)).status === 200, "bulk marking works");
  check(
    (await request("?action=state&id=" + seriesId)).data.episodes.length === 2,
    "bulk deduplicated",
  );
  check(
    (await request("", { ...bulk, watched: false })).status === 200,
    "bulk clear works",
  );
  await pool.query(
    "insert into lists (id,user_id,name,type,visibility) values ($1,$2,$3,$4,$5)",
    [listId, ids[0], "TV test list", "custom", "private"],
  );
  const membership = {
    id: seriesId,
    action: "list",
    listId,
    add: true,
    name: show.name,
    posterPath: show.poster_path,
  };
  check(
    (await request("", membership)).status === 200,
    "custom list add works",
  );
  check(
    (await request("?action=list&listId=" + listId)).data.length === 1,
    "list includes series",
  );
  check(
    (await request(`?action=list&listId=${listId}&ownerId=${ids[0]}`, null, 1))
      .status === 404,
    "private list denied to second user",
  );
  await pool.query(
    "update lists set visibility=$1 where id=$2 and user_id=$3",
    ["public", listId, ids[0]],
  );
  check(
    (await request(`?action=list&listId=${listId}&ownerId=${ids[0]}`, null, 1))
      .data.length === 1,
    "public list visible to second user",
  );
  check(
    (await request("", { ...membership, add: false }, 1)).status === 404,
    "second user cannot modify owner list",
  );
  check(
    (await request("", { ...membership, add: false })).status === 200,
    "list removal works",
  );
  await request("", mark);
  check(
    (await request("", { id: seriesId, action: "remove" })).status === 200,
    "tracking removal works",
  );
  const removed = await request("?action=state&id=" + seriesId);
  check(
    removed.data.state === null && removed.data.episodes.length === 0,
    "tracking removal cascades episode marks",
  );
  console.log(`TV API integration: ${checks} checks passed`);
} finally {
  for (const id of ids)
    await pool.query('delete from "user" where id=$1', [id]);
  if (catalogTouched) {
    if (original)
      await pool.query(
        "update tv_series set name=$2,poster_path=$3,updated_at=$4 where id=$1",
        [seriesId, original.name, original.poster_path, original.updated_at],
      );
    else
      await pool.query(
        "delete from tv_series where id=$1 and not exists(select 1 from user_tv_series where series_id=$1) and not exists(select 1 from list_tv_series where series_id=$1)",
        [seriesId],
      );
  }
  await pool.end();
}
