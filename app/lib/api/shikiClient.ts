import type { CacheEntry } from '@/types/shikimori'

const CACHE_PREFIX = 'shiki_cache_'
const TTL = 30 * 60 * 1000 // 30 minutes

// Rate limiter to avoid rate limit (200ms = 5 requests per sec)
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

function hashKey(keyRaw: string): string {
  let hash = 0
  for (let i = 0; i < keyRaw.length; i++) {
    const char = keyRaw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

export async function shikiGQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const keyRaw = JSON.stringify({ query, variables })
  const key = hashKey(keyRaw)

  const cachedData = getCache<T>(key)
  if (cachedData) {
    return cachedData
  }
  
  // Rate limiting
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()
  
  const res = await fetch('/api/shiki-graphql', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  })
  
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  
  const contentType = res.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    const text = await res.text()
    throw new Error(`Invalid response format: ${text.substring(0, 100)}`)
  }
  
  const json = await res.json() as { data?: T; errors?: Array<{ message: string }> }
  if (json.errors) {
    const msg = json.errors[0]?.message ?? 'GraphQL error'
    throw new Error(msg)
  }
  
  if (json.data) {
    setCache(key, json.data)
    return json.data
  }
  
  throw new Error('No data in response')
}