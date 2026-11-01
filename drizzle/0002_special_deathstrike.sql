ALTER TABLE "list_movies" DROP CONSTRAINT "list_movies_list_id_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "list_movies" DROP CONSTRAINT "list_movies_list_id_movie_id_pk";
--> statement-breakpoint
ALTER TABLE "lists" DROP CONSTRAINT "lists_pkey";
--> statement-breakpoint
ALTER TABLE "list_movies" ADD COLUMN "user_id" text;
--> statement-breakpoint
UPDATE "list_movies" AS lm SET "user_id" = l."user_id" FROM "lists" AS l WHERE l."id" = lm."list_id";
--> statement-breakpoint
ALTER TABLE "list_movies" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "list_movies" ADD CONSTRAINT "list_movies_user_id_list_id_movie_id_pk" PRIMARY KEY("user_id", "list_id", "movie_id");
--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_id_pk" PRIMARY KEY("user_id", "id");
--> statement-breakpoint
ALTER TABLE "list_movies" ADD CONSTRAINT "list_movies_user_id_list_id_lists_user_id_id_fk" FOREIGN KEY ("user_id", "list_id") REFERENCES "public"."lists"("user_id", "id") ON DELETE cascade ON UPDATE no action;
