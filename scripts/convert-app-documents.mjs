import pg from "pg";

const { Pool } = pg;
const apply = process.argv.includes("--apply");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const statements = [
  `CREATE TEMP TABLE _migration_bootstrap (id integer) ON COMMIT DROP`,
  `CREATE OR REPLACE FUNCTION pg_temp.migration_timestamp(value jsonb)
   RETURNS timestamptz LANGUAGE plpgsql AS $$
   DECLARE raw text;
   BEGIN
     IF value IS NULL OR value = 'null'::jsonb THEN RETURN NULL; END IF;
     IF jsonb_typeof(value) = 'object' AND value ? 'seconds' THEN
       RETURN to_timestamp((value->>'seconds')::double precision + coalesce((value->>'nanoseconds')::double precision, 0) / 1000000000.0);
     END IF;
     raw := value #>> '{}';
     IF raw IS NULL OR raw = '' THEN RETURN NULL; END IF;
     IF jsonb_typeof(value) = 'number' OR raw ~ '^[0-9]{11,}$' THEN
       RETURN to_timestamp(raw::double precision / 1000.0);
     END IF;
     RETURN raw::timestamptz;
   EXCEPTION WHEN others THEN RETURN NULL;
   END $$`,
  `DO $$
   DECLARE missing_users text[];
   BEGIN
     SELECT array_agg(DISTINCT required.id) INTO missing_users
     FROM (
       SELECT split_part(path, '/', 2) AS id
       FROM app_document
       WHERE path ~ '^users/[^/]+/(lists/[^/]+/movies/[^/]+|watchLog/[^/]+|friends/[^/]+)$'
       UNION
       SELECT split_part(path, '/', 2)
       FROM app_document WHERE path ~ '^users/[^/]+/lists/[^/]+$'
       UNION
       SELECT data->>'uid' FROM app_document
       WHERE path ~ '^users/[^/]+/friends/[^/]+$' AND data->>'uid' IS NOT NULL
       UNION
       SELECT split_part(path, '/', 4)
       FROM app_document WHERE path ~ '^users/[^/]+/friends/[^/]+$'
       UNION
       SELECT data->>'senderId' FROM app_document
       WHERE path ~ '^chats/[^/]+/messages/[^/]+$' AND data->>'senderId' IS NOT NULL
     ) required
     LEFT JOIN "user" u ON u.id = required.id
     WHERE required.id IS NOT NULL AND u.id IS NULL;
     IF missing_users IS NOT NULL THEN
       RAISE EXCEPTION 'Conversion stopped: missing Better Auth users: %', missing_users;
     END IF;
   END $$`,
  `INSERT INTO movies (id, original_title, original_language, poster_path, backdrop_path, release_date, runtime, vote_average, vote_count, updated_at)
   SELECT split_part(path, '/', 2), data->>'originalTitle', data->>'originalLanguage', data->>'posterPath', data->>'backdropPath', data->>'releaseDate',
     CASE WHEN coalesce(data->>'runtime', '') ~ '^[0-9]+$' THEN (data->>'runtime')::integer END,
     CASE WHEN coalesce(data->>'voteAverage', data->>'vote_average', '') ~ '^-?[0-9]+([.][0-9]+)?$' THEN coalesce(data->>'voteAverage', data->>'vote_average')::real END,
     CASE WHEN coalesce(data->>'voteCount', data->>'vote_count', '') ~ '^[0-9]+$' THEN coalesce(data->>'voteCount', data->>'vote_count')::integer END,
     coalesce(pg_temp.migration_timestamp(data->'updatedAt'), now())
   FROM app_document WHERE path ~ '^movies/[^/]+$'
   ON CONFLICT (id) DO UPDATE SET original_title = coalesce(excluded.original_title, movies.original_title), original_language = coalesce(excluded.original_language, movies.original_language), poster_path = coalesce(excluded.poster_path, movies.poster_path), backdrop_path = coalesce(excluded.backdrop_path, movies.backdrop_path), release_date = coalesce(excluded.release_date, movies.release_date), runtime = coalesce(excluded.runtime, movies.runtime), vote_average = coalesce(excluded.vote_average, movies.vote_average), vote_count = coalesce(excluded.vote_count, movies.vote_count), updated_at = greatest(movies.updated_at, excluded.updated_at)`,
  `INSERT INTO movies (id)
   SELECT DISTINCT movie_id FROM (
     SELECT split_part(path, '/', 6) AS movie_id FROM app_document WHERE path ~ '^users/[^/]+/lists/[^/]+/movies/[^/]+$'
     UNION SELECT split_part(path, '/', 4) FROM app_document WHERE path ~ '^users/[^/]+/watchLog/[^/]+$'
     UNION SELECT split_part(path, '/', 2) FROM app_document WHERE path ~ '^movies/[^/]+/localizations/[^/]+$'
     UNION SELECT split_part(path, '/', 2) FROM app_document WHERE path ~ '^movies/[^/]+/providers/[^/]+$'
     UNION SELECT data->>'movieId' FROM app_document WHERE path ~ '^chats/[^/]+/messages/[^/]+$' AND data->>'movieId' IS NOT NULL
   ) ids WHERE movie_id IS NOT NULL
   ON CONFLICT (id) DO NOTHING`,
  `INSERT INTO movie_localizations (movie_id, locale, title, overview, tagline, genres, trailer, "cast", updated_at)
   SELECT split_part(path, '/', 2), split_part(path, '/', 4), data->>'title', data->>'overview', data->>'tagline',
     CASE WHEN jsonb_typeof(data->'genres') = 'array' THEN data->'genres' ELSE '[]'::jsonb END,
     data->>'trailer', CASE WHEN jsonb_typeof(data->'cast') = 'array' THEN data->'cast' ELSE '[]'::jsonb END,
     coalesce(pg_temp.migration_timestamp(data->'updatedAt'), now())
   FROM app_document WHERE path ~ '^movies/[^/]+/localizations/[^/]+$'
   ON CONFLICT (movie_id, locale) DO UPDATE SET title = coalesce(excluded.title, movie_localizations.title), overview = coalesce(excluded.overview, movie_localizations.overview), tagline = coalesce(excluded.tagline, movie_localizations.tagline), genres = excluded.genres, trailer = coalesce(excluded.trailer, movie_localizations.trailer), "cast" = excluded."cast", updated_at = greatest(movie_localizations.updated_at, excluded.updated_at)`,
  `INSERT INTO movie_providers (movie_id, region, link, flatrate, free, ads, rent, buy, updated_at)
   SELECT split_part(path, '/', 2), split_part(path, '/', 4), data->>'link',
     CASE WHEN jsonb_typeof(data->'flatrate') = 'array' THEN data->'flatrate' ELSE '[]'::jsonb END,
     CASE WHEN jsonb_typeof(data->'free') = 'array' THEN data->'free' ELSE '[]'::jsonb END,
     CASE WHEN jsonb_typeof(data->'ads') = 'array' THEN data->'ads' ELSE '[]'::jsonb END,
     CASE WHEN jsonb_typeof(data->'rent') = 'array' THEN data->'rent' ELSE '[]'::jsonb END,
     CASE WHEN jsonb_typeof(data->'buy') = 'array' THEN data->'buy' ELSE '[]'::jsonb END,
     coalesce(pg_temp.migration_timestamp(data->'updatedAt'), now())
   FROM app_document WHERE path ~ '^movies/[^/]+/providers/[^/]+$'
   ON CONFLICT (movie_id, region) DO UPDATE SET link = coalesce(excluded.link, movie_providers.link), flatrate = excluded.flatrate, free = excluded.free, ads = excluded.ads, rent = excluded.rent, buy = excluded.buy, updated_at = greatest(movie_providers.updated_at, excluded.updated_at)`,
  `UPDATE "user" u SET
     name = coalesce(nullif(d.data->>'displayName', ''), nullif(d.data->>'name', ''), u.name),
     image = coalesce(nullif(d.data->>'photoURL', ''), u.image),
     language = coalesce(nullif(d.data->>'language', ''), u.language),
     region = coalesce(nullif(d.data->>'region', ''), u.region),
     last_seen_at = coalesce(pg_temp.migration_timestamp(d.data->'lastSeen'), u.last_seen_at),
     updated_at = now()
   FROM app_document d WHERE d.path = 'users/' || u.id`,
  `INSERT INTO lists (id, user_id, name, type, visibility, show_on_home, created_at, updated_at)
   SELECT split_part(path, '/', 4), split_part(path, '/', 2), coalesce(data->>'name', split_part(path, '/', 4)), coalesce(data->>'type', 'custom'), coalesce(data->>'visibility', 'private'), coalesce((data->>'showOnHome')::boolean, false), coalesce(pg_temp.migration_timestamp(data->'createdAt'), now()), coalesce(pg_temp.migration_timestamp(data->'updatedAt'), now())
   FROM app_document WHERE path ~ '^users/[^/]+/lists/[^/]+$'
   ON CONFLICT (user_id, id) DO UPDATE SET name = excluded.name, type = excluded.type, visibility = excluded.visibility, show_on_home = excluded.show_on_home, updated_at = excluded.updated_at`,
  `INSERT INTO list_movies (user_id, list_id, movie_id, title, poster_path, added_at)
   SELECT split_part(path, '/', 2), split_part(path, '/', 4), split_part(path, '/', 6), data->>'title', data->>'posterPath', coalesce(pg_temp.migration_timestamp(data->'addedAt'), now())
   FROM app_document WHERE path ~ '^users/[^/]+/lists/[^/]+/movies/[^/]+$' AND split_part(path, '/', 4) <> 'wishlist'
   ON CONFLICT (user_id, list_id, movie_id) DO UPDATE SET title = coalesce(excluded.title, list_movies.title), poster_path = coalesce(excluded.poster_path, list_movies.poster_path), added_at = least(list_movies.added_at, excluded.added_at)`,
  `INSERT INTO wishlist (user_id, movie_id, title, poster_path, added_at)
   SELECT split_part(path, '/', 2), split_part(path, '/', 6), data->>'title', data->>'posterPath', coalesce(pg_temp.migration_timestamp(data->'addedAt'), now())
   FROM app_document WHERE path ~ '^users/[^/]+/lists/wishlist/movies/[^/]+$'
   ON CONFLICT (user_id, movie_id) DO UPDATE SET title = coalesce(excluded.title, wishlist.title), poster_path = coalesce(excluded.poster_path, wishlist.poster_path), added_at = least(wishlist.added_at, excluded.added_at)`,
  `INSERT INTO watch_logs (user_id, movie_id, is_watched, watched_at, watch_history, rating, review, updated_at)
   SELECT split_part(path, '/', 2), split_part(path, '/', 4), coalesce((data->>'isWatched')::boolean, data->>'status' = 'watched', false), pg_temp.migration_timestamp(data->'watchedAt'),
     CASE WHEN jsonb_typeof(data->'watchHistory') = 'array' THEN data->'watchHistory' ELSE '[]'::jsonb END,
     CASE WHEN coalesce(data->>'rating', '') ~ '^-?[0-9]+([.][0-9]+)?$' THEN (data->>'rating')::real END,
     data->>'review', coalesce(pg_temp.migration_timestamp(data->'updatedAt'), now())
   FROM app_document WHERE path ~ '^users/[^/]+/watchLog/[^/]+$'
   ON CONFLICT (user_id, movie_id) DO UPDATE SET is_watched = excluded.is_watched, watched_at = coalesce(excluded.watched_at, watch_logs.watched_at), watch_history = excluded.watch_history, rating = coalesce(excluded.rating, watch_logs.rating), review = coalesce(excluded.review, watch_logs.review), updated_at = greatest(watch_logs.updated_at, excluded.updated_at)`,
  `INSERT INTO friends (user_id, friend_user_id, created_at)
   SELECT split_part(path, '/', 2), split_part(path, '/', 4), coalesce(pg_temp.migration_timestamp(data->'addedAt'), now())
   FROM app_document WHERE path ~ '^users/[^/]+/friends/[^/]+$'
   ON CONFLICT (user_id, friend_user_id) DO UPDATE SET created_at = least(friends.created_at, excluded.created_at)`,
  `INSERT INTO chats (id, participants, last_message, last_message_at, last_message_sender_id, unread_by, created_at, updated_at)
   SELECT split_part(path, '/', 2), CASE WHEN jsonb_typeof(data->'participants') = 'array' THEN data->'participants' ELSE '[]'::jsonb END, data->>'lastMessage', pg_temp.migration_timestamp(data->'lastMessageAt'),
     CASE WHEN EXISTS (SELECT 1 FROM "user" u WHERE u.id = data->>'lastMessageSenderId') THEN data->>'lastMessageSenderId' END,
     CASE WHEN jsonb_typeof(data->'unreadBy') = 'array' THEN data->'unreadBy' ELSE '[]'::jsonb END, coalesce(pg_temp.migration_timestamp(data->'createdAt'), now()), coalesce(pg_temp.migration_timestamp(data->'updatedAt'), now())
   FROM app_document WHERE path ~ '^chats/[^/]+$'
   ON CONFLICT (id) DO UPDATE SET participants = excluded.participants, last_message = excluded.last_message, last_message_at = excluded.last_message_at, last_message_sender_id = excluded.last_message_sender_id, unread_by = excluded.unread_by, updated_at = excluded.updated_at`,
  `INSERT INTO messages (id, chat_id, sender_id, text, type, movie_id, movie_title, movie_poster, created_at)
   SELECT split_part(d.path, '/', 4), split_part(d.path, '/', 2), d.data->>'senderId', d.data->>'text', coalesce(d.data->>'type', 'text'),
     CASE WHEN m.id IS NOT NULL THEN d.data->>'movieId' END, d.data->>'movieTitle', d.data->>'moviePoster', coalesce(pg_temp.migration_timestamp(d.data->'createdAt'), now())
   FROM app_document d
   LEFT JOIN movies m ON m.id = d.data->>'movieId'
   WHERE d.path ~ '^chats/[^/]+/messages/[^/]+$'
     AND EXISTS (SELECT 1 FROM chats c WHERE c.id = split_part(d.path, '/', 2))
     AND EXISTS (SELECT 1 FROM "user" u WHERE u.id = d.data->>'senderId')
   ON CONFLICT (id) DO UPDATE SET text = excluded.text, type = excluded.type, movie_id = excluded.movie_id, movie_title = excluded.movie_title, movie_poster = excluded.movie_poster`,
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const table = await client.query("SELECT to_regclass('public.app_document') AS source_table");
    if (!table.rows[0].source_table) throw new Error("Source table public.app_document does not exist");
    await client.query("LOCK TABLE app_document IN ACCESS EXCLUSIVE MODE");
    const expected = ["movies", "movie_localizations", "movie_providers", "lists", "list_movies", "wishlist", "watch_logs", "friends", "chats", "messages"];
    const missing = [];
    for (const name of expected) {
      const exists = await client.query("SELECT to_regclass($1) IS NOT NULL AS present", [`public.${name}`]);
      if (!exists.rows[0].present) missing.push(name);
    }
    if (missing.length) throw new Error(`Apply the generated schema migrations first; missing tables: ${missing.join(", ")}`);

    const before = await client.query("SELECT count(*)::int AS count FROM app_document");
    for (const statement of statements) await client.query(statement);

    const converted = {};
    for (const name of expected) {
      const result = await client.query(`SELECT count(*)::int AS count FROM "${name}"`);
      converted[name] = result.rows[0].count;
    }
    if (apply) {
      await client.query("DROP TABLE app_document");
      await client.query("COMMIT");
      console.log(`Converted ${before.rows[0].count} app_document rows and dropped app_document.`);
    } else {
      await client.query("ROLLBACK");
      console.log(`Dry run successful: ${before.rows[0].count} source rows. Target row counts (existing rows included):`);
    }
    console.log(JSON.stringify(converted, null, 2));
    if (!apply) console.log("Run with --apply to convert and drop the old table.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
