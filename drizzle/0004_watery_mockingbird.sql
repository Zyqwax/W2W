CREATE TABLE "list_tv_series" (
	"user_id" text NOT NULL,
	"list_id" text NOT NULL,
	"series_id" text NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "list_tv_series_user_id_list_id_series_id_pk" PRIMARY KEY("user_id","list_id","series_id")
);
--> statement-breakpoint
CREATE TABLE "tv_series" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"poster_path" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_tv_episodes" (
	"user_id" text NOT NULL,
	"series_id" text NOT NULL,
	"season_number" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"watched_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_tv_episodes_user_id_series_id_season_number_episode_number_pk" PRIMARY KEY("user_id","series_id","season_number","episode_number")
);
--> statement-breakpoint
CREATE TABLE "user_tv_series" (
	"user_id" text NOT NULL,
	"series_id" text NOT NULL,
	"status" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_tv_series_user_id_series_id_pk" PRIMARY KEY("user_id","series_id")
);
--> statement-breakpoint
ALTER TABLE "list_tv_series" ADD CONSTRAINT "list_tv_series_series_id_tv_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."tv_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_tv_series" ADD CONSTRAINT "list_tv_series_user_id_list_id_lists_user_id_id_fk" FOREIGN KEY ("user_id","list_id") REFERENCES "public"."lists"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tv_episodes" ADD CONSTRAINT "user_tv_episodes_user_id_series_id_user_tv_series_user_id_series_id_fk" FOREIGN KEY ("user_id","series_id") REFERENCES "public"."user_tv_series"("user_id","series_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tv_series" ADD CONSTRAINT "user_tv_series_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tv_series" ADD CONSTRAINT "user_tv_series_series_id_tv_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."tv_series"("id") ON DELETE cascade ON UPDATE no action;