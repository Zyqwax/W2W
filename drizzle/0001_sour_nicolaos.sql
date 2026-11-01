CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"participants" jsonb NOT NULL,
	"last_message" text,
	"last_message_at" timestamp with time zone,
	"last_message_sender_id" text,
	"unread_by" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friends" (
	"user_id" text NOT NULL,
	"friend_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friends_user_id_friend_user_id_pk" PRIMARY KEY("user_id","friend_user_id")
);
--> statement-breakpoint
CREATE TABLE "list_movies" (
	"list_id" text NOT NULL,
	"movie_id" text NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "list_movies_list_id_movie_id_pk" PRIMARY KEY("list_id","movie_id")
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'custom' NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"show_on_home" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"text" text,
	"type" text DEFAULT 'text' NOT NULL,
	"movie_id" text,
	"movie_title" text,
	"movie_poster" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_localizations" (
	"movie_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text,
	"overview" text,
	"tagline" text,
	"genres" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"trailer" text,
	"cast" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movie_localizations_movie_id_locale_pk" PRIMARY KEY("movie_id","locale")
);
--> statement-breakpoint
CREATE TABLE "movie_providers" (
	"movie_id" text NOT NULL,
	"region" text NOT NULL,
	"link" text,
	"flatrate" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"free" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ads" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rent" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"buy" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movie_providers_movie_id_region_pk" PRIMARY KEY("movie_id","region")
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" text PRIMARY KEY NOT NULL,
	"original_title" text,
	"original_language" text,
	"poster_path" text,
	"backdrop_path" text,
	"release_date" text,
	"runtime" integer,
	"vote_average" real,
	"vote_count" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watch_logs" (
	"user_id" text NOT NULL,
	"movie_id" text NOT NULL,
	"is_watched" boolean DEFAULT false NOT NULL,
	"watched_at" timestamp with time zone,
	"watch_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rating" real,
	"review" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_logs_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"user_id" text NOT NULL,
	"movie_id" text NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "language" text DEFAULT 'tr' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "region" text DEFAULT 'TR' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_last_message_sender_id_user_id_fk" FOREIGN KEY ("last_message_sender_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_friend_user_id_user_id_fk" FOREIGN KEY ("friend_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_movies" ADD CONSTRAINT "list_movies_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_movies" ADD CONSTRAINT "list_movies_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_localizations" ADD CONSTRAINT "movie_localizations_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_providers" ADD CONSTRAINT "movie_providers_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_logs" ADD CONSTRAINT "watch_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_logs" ADD CONSTRAINT "watch_logs_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "friends_friend_user_id_idx" ON "friends" USING btree ("friend_user_id");--> statement-breakpoint
CREATE INDEX "list_movies_movie_id_idx" ON "list_movies" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "lists_user_id_idx" ON "lists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "messages_chat_created_idx" ON "messages" USING btree ("chat_id","created_at");--> statement-breakpoint
CREATE INDEX "watch_logs_user_watched_idx" ON "watch_logs" USING btree ("user_id","watched_at");--> statement-breakpoint
CREATE INDEX "wishlist_movie_id_idx" ON "wishlist" USING btree ("movie_id");