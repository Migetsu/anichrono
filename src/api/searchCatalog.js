import { shikiGQL } from '@/api/shikiClient.js'

const ORDER_WHITELIST = new Set(['popularity', 'ranked', 'aired_on'])

function buildFilters({ genres = [], year = null, status = null, kind = null, rating = null }) {
  const filters = []
  if (Array.isArray(genres) && genres.length) {
    // Shikimori GraphQL: genres includes by slug/name may not be supported as array param everywhere.
    // Используем text search + статус/год/сортировки как базу; жанры отфильтруем на клиенте как fallback.
    filters.push('// genres client-side fallback')
  }
  if (year) filters.push(`airedOn: { year: ${Number(year)} }`)
  if (status) filters.push(`status: ${status}`)
  if (kind) filters.push(`kind: ${kind}`)
  if (rating) filters.push(`rating: ${rating}`)
  return filters.length ? `# ${filters.join('\n  ')}` : ''
}

export async function searchCatalog({ page = 1, limit = 20, search = '', status = null, order = 'popularity' } = {}) {
  const safeOrder = ORDER_WHITELIST.has(order) ? order : 'popularity'
  const filtersComment = ''
  const QUERY = `
    query ($page: Int, $limit: Int, $search: String, $status: AnimeStatusString) {
      animes(page: $page, limit: $limit, search: $search, status: $status, order: ${safeOrder}) {
        id
        name
        russian
        score
        status
        poster { originalUrl }
        genres { id name russian }
        airedOn { year month }
      }
    }
  `

  // Формируем варианты запроса с учётом е/ё для улучшения поиска по-русски
  const variants = new Set()
  const q = String(search || '')
  variants.add(q)
  if (q) {
    if (q.includes('е') || q.includes('Е')) variants.add(q.replace(/е/g, 'ё').replace(/Е/g, 'Ё'))
    if (q.includes('ё') || q.includes('Ё')) variants.add(q.replace(/ё/g, 'е').replace(/Ё/g, 'Е'))
  }

  const requests = Array.from(variants).map(v =>
    shikiGQL(QUERY, { page, limit, search: v || null, status: status || null })
      .then(r => Array.isArray(r?.animes) ? r.animes : [])
      .catch(() => [])
  )
  const results = await Promise.all(requests)

  // Сливаем и убираем дубликаты по id, сохраняя порядок первой выдачи
  const seen = new Set()
  const merged = []
  for (const arr of results) {
    for (const a of arr) {
      if (!a || seen.has(a.id)) continue
      seen.add(a.id)
      merged.push(a)
    }
  }
  return merged
}


