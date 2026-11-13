/**
 * "Kids / short-form" filter shared by the app and the Nitro handlers.
 *
 * Shikimori marks obvious children's shows with the genre "Детское" (id 15),
 * but many short kids' series only carry a G rating. The rules below keep such
 * titles out of the catalog, the schedule and the home page:
 *
 *   1. the "Детское" genre always means a kids' title;
 *   2. a G-rated TV (or TV special) is children's programming;
 *   3. a G-rated short (up to KIDS_SHORT_DURATION minutes, or unknown length)
 *      is a kids' short; G-rated feature films stay in the catalog;
 *   4. a G-rated magical-girl show is a kids' franchise.
 *
 * Everything else is kept, including G-rated feature films.
 */

export const KIDS_GENRE_IDS: ReadonlySet<number> = new Set([15])
export const KIDS_MAGICAL_GIRL_GENRE_ID = 124
export const KIDS_SHORT_DURATION = 40
/** Comedy, slice of life, anthropomorphism: genres a G-rated kids movie is made of. */
export const KIDS_FILM_GENRE_IDS: ReadonlySet<number> = new Set([4, 36, 143])

export interface KidsCandidate {
  readonly rating?: string | null
  readonly kind?: string | null
  readonly duration?: number | null
  readonly genres?: ReadonlyArray<{
    readonly id?: number | string | null
    readonly name?: string | null
    readonly russian?: string | null
  }> | null
}

export function isKidsAnime(item: KidsCandidate): boolean {
  const genres = item.genres ?? []

  for (const genre of genres) {
    if (genre.id != null && KIDS_GENRE_IDS.has(Number(genre.id))) return true
    if (genre.russian === 'Детское' || genre.name === 'Kids') return true
  }

  if (item.rating !== 'g') return false

  if (item.kind === 'tv' || item.kind === 'tv_special') return true

  const duration = Number(item.duration ?? 0)
  if (!duration || duration < KIDS_SHORT_DURATION) return true

  if (genres.some(genre => Number(genre.id) === KIDS_MAGICAL_GIRL_GENRE_ID)) return true

  // A G-rated feature made only of comedy / slice of life / anthropomorphism
  // is a kids' movie (e.g. the Chiikawa film), unlike family films that also
  // carry adventure, drama or awards.
  const filmGenres = genres.filter(genre => genre.id != null)
  return item.kind === 'movie'
    && filmGenres.length > 0
    && filmGenres.every(genre => KIDS_FILM_GENRE_IDS.has(Number(genre.id)))
}
