// Catalog filter types

export type AnimeStatus = 'anons' | 'ongoing' | 'released'
export type AnimeKind = 'tv' | 'movie' | 'ova' | 'ona' | 'special' | 'tv_special' | 'music' | 'pv' | 'cm'
export type AnimeRating = 'none' | 'g' | 'pg' | 'pg_13' | 'r' | 'r_plus' | 'rx'
export type AnimeOrder = 'id' | 'ranked' | 'kind' | 'popularity' | 'name' | 'aired_on' | 'episodes' | 'status' | 'random'
export type AnimeSeason = 'winter' | 'spring' | 'summer' | 'fall'

export interface CatalogFilters {
  search?: string
  status?: AnimeStatus[]
  kind?: AnimeKind[]
  season?: string // Format: "winter_2024" or "2024"
  score?: number // Minimum score (1-9)
  rating?: AnimeRating[]
  order?: AnimeOrder
  genre?: number[] // Genre IDs
  page?: number
  limit?: number
}

export interface FilterOption<T = string> {
  value: T
  label: string
  labelRu?: string
}

// Status options
export const STATUS_OPTIONS: FilterOption<AnimeStatus>[] = [
  { value: 'anons', label: 'Announced', labelRu: 'Анонсировано' },
  { value: 'ongoing', label: 'Ongoing', labelRu: 'Сейчас выходит' },
  { value: 'released', label: 'Released', labelRu: 'Вышедшее' }
]

// Kind/Type options
export const KIND_OPTIONS: FilterOption<AnimeKind>[] = [
  { value: 'tv', label: 'TV Series', labelRu: 'TV Сериал' },
  { value: 'movie', label: 'Movie', labelRu: 'Фильм' },
  { value: 'ova', label: 'OVA', labelRu: 'OVA' },
  { value: 'ona', label: 'ONA', labelRu: 'ONA' },
  { value: 'special', label: 'Special', labelRu: 'Спецвыпуск' },
  { value: 'tv_special', label: 'TV Special', labelRu: 'TV Спецвыпуск' },
  { value: 'music', label: 'Music', labelRu: 'Клип' },
  { value: 'pv', label: 'PV', labelRu: 'Проморолик' },
  { value: 'cm', label: 'CM', labelRu: 'Реклама' }
]

// Rating options
export const RATING_OPTIONS: FilterOption<AnimeRating>[] = [
  { value: 'g', label: 'G', labelRu: 'G - Для всех' },
  { value: 'pg', label: 'PG', labelRu: 'PG - Для детей' },
  { value: 'pg_13', label: 'PG-13', labelRu: 'PG-13 - Подросткам 13+' },
  { value: 'r', label: 'R-17', labelRu: 'R-17 - Насилие/язык' },
  { value: 'r_plus', label: 'R+', labelRu: 'R+ - Лёгкая эротика' },
  { value: 'rx', label: 'Rx', labelRu: 'Rx - Хентай' }
]

// Order options
export const ORDER_OPTIONS: FilterOption<AnimeOrder>[] = [
  { value: 'ranked', label: 'By Rating', labelRu: 'По рейтингу' },
  { value: 'popularity', label: 'By Popularity', labelRu: 'По популярности' },
  { value: 'name', label: 'By Name', labelRu: 'По алфавиту' },
  { value: 'aired_on', label: 'By Aired Date', labelRu: 'По дате выхода' },
  { value: 'id', label: 'By ID', labelRu: 'По ID' }
]

// Score options
export const SCORE_OPTIONS: FilterOption<number>[] = [
  { value: 8, label: '8+', labelRu: '8+' },
  { value: 7, label: '7+', labelRu: '7+' },
  { value: 6, label: '6+', labelRu: '6+' }
]

// Generate season options dynamically
export function generateSeasonOptions(): FilterOption<string>[] {
  const currentYear = new Date().getFullYear()
  const options: FilterOption<string>[] = []
  
  const seasons: { value: AnimeSeason; labelRu: string }[] = [
    { value: 'winter', labelRu: 'Зима' },
    { value: 'spring', labelRu: 'Весна' },
    { value: 'summer', labelRu: 'Лето' },
    { value: 'fall', labelRu: 'Осень' }
  ]
  
  // Next year seasons
  for (const s of seasons) {
    options.push({
      value: `${s.value}_${currentYear + 1}`,
      label: `${s.labelRu} ${currentYear + 1}`,
      labelRu: `${s.labelRu} ${currentYear + 1}`
    })
  }
  
  // Current year seasons
  for (const s of seasons) {
    options.push({
      value: `${s.value}_${currentYear}`,
      label: `${s.labelRu} ${currentYear}`,
      labelRu: `${s.labelRu} ${currentYear}`
    })
  }
  
  // Year ranges
  options.push({ value: String(currentYear + 1), label: `${currentYear + 1} год`, labelRu: `${currentYear + 1} год` })
  options.push({ value: String(currentYear), label: `${currentYear} год`, labelRu: `${currentYear} год` })
  options.push({ value: `${currentYear - 2}_${currentYear - 1}`, label: `${currentYear - 2}-${currentYear - 1}`, labelRu: `${currentYear - 2}-${currentYear - 1}` })
  options.push({ value: '2018_2022', label: '2018-2022', labelRu: '2018-2022' })
  options.push({ value: '2011_2017', label: '2011-2017', labelRu: '2011-2017' })
  options.push({ value: '2000_2010', label: '2000-2010', labelRu: '2000-2010' })
  options.push({ value: '199x', label: '1990-е годы', labelRu: '1990-е годы' })
  options.push({ value: '198x', label: '1980-е годы', labelRu: '1980-е годы' })
  options.push({ value: 'ancient', label: 'Более старые', labelRu: 'Более старые' })
  
  return options
}

export interface Genre {
  id: number
  name: string
  russian: string
  kind: 'anime' | 'manga'
}

export interface CatalogResponse {
  animes: import('./shikimori').ShikimoriAnimeListItem[]
  hasMore: boolean
}