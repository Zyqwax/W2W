import {
  boolean,
  foreignKey,
  integer,
  index,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  language: text("language").notNull().default("tr"),
  region: text("region").notNull().default("TR"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Canonical TMDB catalog. User-specific state lives in wishlist, watchLog,
// and listMovies rather than being duplicated on this shared movie record.
export const movies = pgTable("movies", {
  id: text("id").primaryKey(), // TMDB ID, kept as text for path/API compatibility.
  originalTitle: text("original_title"),
  originalLanguage: text("original_language"),
  posterPath: text("poster_path"),
  backdropPath: text("backdrop_path"),
  releaseDate: text("release_date"),
  runtime: integer("runtime"),
  voteAverage: real("vote_average"),
  voteCount: integer("vote_count"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const movieLocalizations = pgTable("movie_localizations", {
  movieId: text("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  locale: text("locale").notNull(),
  title: text("title"),
  overview: text("overview"),
  tagline: text("tagline"),
  genres: jsonb("genres").$type<string[]>().notNull().default([]),
  trailer: text("trailer"),
  cast: jsonb("cast").$type<Record<string, unknown>[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.movieId, table.locale] })]);

export const movieProviders = pgTable("movie_providers", {
  movieId: text("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  region: text("region").notNull(),
  link: text("link"),
  flatrate: jsonb("flatrate").$type<Record<string, unknown>[]>().notNull().default([]),
  free: jsonb("free").$type<Record<string, unknown>[]>().notNull().default([]),
  ads: jsonb("ads").$type<Record<string, unknown>[]>().notNull().default([]),
  rent: jsonb("rent").$type<Record<string, unknown>[]>().notNull().default([]),
  buy: jsonb("buy").$type<Record<string, unknown>[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.movieId, table.region] })]);

export const lists = pgTable("lists", {
  id: text("id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull().default("custom"),
  visibility: text("visibility").notNull().default("private"),
  showOnHome: boolean("show_on_home").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.id] }),
  index("lists_user_id_idx").on(table.userId),
]);

export const listMovies = pgTable("list_movies", {
  userId: text("user_id").notNull(),
  listId: text("list_id").notNull(),
  movieId: text("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  title: text("title"),
  posterPath: text("poster_path"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.listId, table.movieId] }),
  foreignKey({ columns: [table.userId, table.listId], foreignColumns: [lists.userId, lists.id] }).onDelete("cascade"),
  index("list_movies_movie_id_idx").on(table.movieId),
]);

export const wishlist = pgTable("wishlist", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  movieId: text("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  title: text("title"),
  posterPath: text("poster_path"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.movieId] }),
  index("wishlist_movie_id_idx").on(table.movieId),
]);

export const watchLogs = pgTable("watch_logs", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  movieId: text("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  isWatched: boolean("is_watched").notNull().default(false),
  watchedAt: timestamp("watched_at", { withTimezone: true }),
  watchHistory: jsonb("watch_history").$type<Record<string, unknown>[]>().notNull().default([]),
  rating: real("rating"),
  review: text("review"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.movieId] }),
  index("watch_logs_user_watched_idx").on(table.userId, table.watchedAt),
]);

export const friends = pgTable("friends", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  friendUserId: text("friend_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.friendUserId] }),
  index("friends_friend_user_id_idx").on(table.friendUserId),
]);

export const chats = pgTable("chats", {
  id: text("id").primaryKey(),
  participants: jsonb("participants").$type<string[]>().notNull(),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  lastMessageSenderId: text("last_message_sender_id").references(() => user.id, { onDelete: "set null" }),
  unreadBy: jsonb("unread_by").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// TV tracking is keyed separately from movies because TMDB IDs may overlap.
export const tvSeries = pgTable("tv_series", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  posterPath: text("poster_path"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userTvSeries = pgTable("user_tv_series", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  seriesId: text("series_id").notNull().references(() => tvSeries.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.userId, table.seriesId] })]);

export const userTvEpisodes = pgTable("user_tv_episodes", {
  userId: text("user_id").notNull(),
  seriesId: text("series_id").notNull(),
  seasonNumber: integer("season_number").notNull(),
  episodeNumber: integer("episode_number").notNull(),
  watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.seriesId, table.seasonNumber, table.episodeNumber] }),
  foreignKey({ columns: [table.userId, table.seriesId], foreignColumns: [userTvSeries.userId, userTvSeries.seriesId] }).onDelete("cascade"),
]);

export const listTvSeries = pgTable("list_tv_series", {
  userId: text("user_id").notNull(),
  listId: text("list_id").notNull(),
  seriesId: text("series_id").notNull().references(() => tvSeries.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.listId, table.seriesId] }),
  foreignKey({ columns: [table.userId, table.listId], foreignColumns: [lists.userId, lists.id] }).onDelete("cascade"),
]);

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  text: text("text"),
  type: text("type").notNull().default("text"),
  movieId: text("movie_id").references(() => movies.id, { onDelete: "set null" }),
  movieTitle: text("movie_title"),
  moviePoster: text("movie_poster"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("messages_chat_created_idx").on(table.chatId, table.createdAt)]);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("session_user_id_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("account_user_id_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

// Source table consumed by scripts/convert-app-documents.mjs.
export const appDocument = pgTable("app_document", {
  path: text("path").primaryKey(),
  collectionPath: text("collection_path").notNull(),
  documentId: text("document_id").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("app_document_collection_idx").on(table.collectionPath),
  uniqueIndex("app_document_collection_id_idx").on(table.collectionPath, table.documentId),
]);
