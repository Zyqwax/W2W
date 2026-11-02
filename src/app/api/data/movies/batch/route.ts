import { NextRequest } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { movieLocalizations, movies } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids) ? [...new Set<string>(body.ids.map(String))].slice(0, 200) : [];
    const locale = typeof body.locale === "string" ? body.locale : "tr-TR";
    if (!ids.length) return Response.json([]);

    const rows = await db.select({ movie: movies, localization: movieLocalizations })
      .from(movies)
      .leftJoin(movieLocalizations, and(eq(movieLocalizations.movieId, movies.id), eq(movieLocalizations.locale, locale)))
      .where(inArray(movies.id, ids));
    return Response.json(rows.map(({ movie, localization }) => ({
      id: movie.id,
      originalTitle: movie.originalTitle,
      originalLanguage: movie.originalLanguage,
      posterPath: movie.posterPath,
      backdropPath: movie.backdropPath,
      releaseDate: movie.releaseDate,
      runtime: movie.runtime,
      voteAverage: movie.voteAverage,
      voteCount: movie.voteCount,
      hasLocalization: Boolean(localization),
      ...(localization ? {
        title: localization.title,
        overview: localization.overview,
        tagline: localization.tagline,
        genres: localization.genres,
        trailer: localization.trailer,
        cast: localization.cast,
      } : {}),
    })));
  } catch (error) {
    console.error("Batch movie read failed:", error);
    return Response.json({ error: "Could not load movies" }, { status: 400 });
  }
}
