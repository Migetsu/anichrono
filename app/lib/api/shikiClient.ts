import type { CacheEntry } from '@/types/shikimori'

const CACHE_PREFIX = 'shiki_cache_'
const TTL = 30 * 60 * 1000 // 30 minutes

// Server-side memory cache: SSR renders several pages per minute and Shikimori
// rate-limits aggressive clients. A short-lived cache keeps upstream calls low.
const SERVER_TTL = 60 * 1000
const SERVER_CACHE_MAX = 200
const serverCache = new Map<string, { data: unknown, time: number }>()

// Rate limiter for the browser only: SSR requests are already serialized and
// must not sleep, otherwise server rendering and sitemap generation crawl.
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 300

function getCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key)
    if (!item) return null
    
    const parsed: CacheEntry<T> = JSON.parse(item)
    if (Date.now() - parsed.time < TTL) {
      return parsed.data
    } else {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
  } catch {
    return null
  }
}

function setCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  
  try {
    const item = JSON.stringify({ data, time: Date.now() })
    localStorage.setItem(CACHE_PREFIX + key, item)
  } catch (e: unknown) {
    const error = e as Error & { name?: string }
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k?.startsWith(CACHE_PREFIX)) {
            keysToRemove.push(k)
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k))
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, time: Date.now() }))
      } catch {
        // Silently fail if cache cannot be set
      }
    }
  }
}

function getServerCache<T>(key: string): T | null {
  const hit = serverCache.get(key)
  if (!hit) return null
  if (Date.now() - hit.time > SERVER_TTL) {
    serverCache.delete(key)
    return null
  }
  return hit.data as T
}

function setServerCache(key: string, data: unknown): void {
  if (serverCache.size >= SERVER_CACHE_MAX) {
    const oldest = serverCache.keys().next().value
    if (oldest) serverCache.delete(oldest)
  }
  serverCache.set(key, { data, time: Date.now() })
}

function hashKey(keyRaw: string): string {
  let hash = 0
  for (let i = 0; i < keyRaw.length; i++) {
    const char = keyRaw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

/**
 * GraphQL request through the Nitro proxy. `$fetch` is used instead of the
 * native `fetch` so the same call works during server rendering (relative
 * URLs are not supported by `fetch` in Node).
 */
export async function shikiGQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const keyRaw = JSON.stringify({ query, variables })
  const key = hashKey(keyRaw)
  const isServer = typeof window === 'undefined'

  const cachedData = getCache<T>(key)
  if (cachedData) {
    return cachedData
  }

  if (isServer) {
    const serverHit = getServerCache<T>(key)
    if (serverHit) return serverHit
  } else {
    const wait = MIN_REQUEST_INTERVAL - (Date.now() - lastRequestTime)
    if (wait > 0) {
      await new Promise(resolve => setTimeout(resolve, wait))
    }
    lastRequestTime = Date.now()
  }

  let json: GraphQLResponse<T> | null = null

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      json = await $fetch<GraphQLResponse<T>>('/api/shiki-graphql', {
        method: 'POST',
        body: { query, variables },
      })
      break
    } catch (e: unknown) {
      const error = e as { status?: number, statusMessage?: string, message?: string }
      if (error.status === 429 && attempt === 0) {
        // Shikimori rate limit: one short pause usually clears it.
        await new Promise(resolve => setTimeout(resolve, 1200))
        continue
      }
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      throw new Error(error.statusMessage || error.message || 'Shikimori request failed')
    }
  }

  if (json?.errors?.length) {
    throw new Error(json.errors[0]?.message ?? 'GraphQL error')
  }

  if (json?.data) {
    setCache(key, json.data)
    if (isServer) setServerCache(key, json.data)
    return json.data
  }

  throw new Error('No data in response')
}
