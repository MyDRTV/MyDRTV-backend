// scripts/examples/migrate-movies-to-mongodb.mjs
// Kodeeksempel til eksamen. Funktionen viser migrering af film og genrer.

export async function migrateMovies(postgres, mongoDb) {
  const { rows: movies } = await postgres.query(`
    SELECT
      m.movie_pk::text AS _id,
      m.movie_title AS title,
      m.movie_release_year::int AS "releaseYear",
      m.movie_description AS description,
      m.movie_poster_url AS "posterUrl",
      ARRAY(
        SELECT g.genre_name
        FROM junction_movie_genres j
        JOIN genres g ON g.genre_pk = j.genre_fk
        WHERE j.movie_fk = m.movie_pk
        ORDER BY g.genre_name
      ) AS genres
    FROM movies m
  `)

  for (const movie of movies) {
    await mongoDb.collection("movies").replaceOne(
      { _id: movie._id },
      movie,
      { upsert: true }
    )
  }
}