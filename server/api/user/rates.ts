// GET  /api/user/rates             → list rates
// POST /api/user/rates             → create
// PUT  /api/user/rates?id=:id      → update
// DELETE /api/user/rates?id=:id   → destroy

const SHIKI_BASE = 'https://shikimori.io'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'shiki_token')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const method = getMethod(event)
  const query = getQuery(event)

  const headers: Record<string, string> = {
    'User-Agent': process.env.SHIKI_USER_AGENT || 'AniChrono',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  }

  // ── GET ─────────────────────────────────────────────────────────────────────
  if (method === 'GET') {
    const params = new URLSearchParams()
    if (query.user_id)     params.set('user_id',      String(query.user_id))
    if (query.target_type) params.set('target_type',  String(query.target_type))
    if (query.target_id)   params.set('target_id',    String(query.target_id))
    if (query.status)      params.set('status',       String(query.status))
    if (query.page)        params.set('page',          String(query.page))
    if (query.limit)       params.set('limit',         String(query.limit))

    try {
      const data = await $fetch(`${SHIKI_BASE}/api/v2/user_rates?${params.toString()}`, {
        headers,
        timeout: 12000,
      })
      return data
    } catch (err: any) {
      const status = err?.response?.status ?? err?.statusCode ?? 502
      console.error(`[rates GET] ${status}`, err?.response?._data ?? err?.message)
      throw createError({ statusCode: status, statusMessage: `Shikimori user_rates error: ${status}` })
    }
  }

  // ── POST ────────────────────────────────────────────────────────────────────
  if (method === 'POST') {
    const body = await readBody(event)
    try {
      return await $fetch(`${SHIKI_BASE}/api/v2/user_rates`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_rate: body }),
      })
    } catch (err: any) {
      throw createError({ statusCode: err?.statusCode || 502, statusMessage: 'Failed to create rate' })
    }
  }

  // ── PUT/PATCH ────────────────────────────────────────────────────────────────
  if (method === 'PUT' || method === 'PATCH') {
    const id = query.id
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing rate id' })
    const body = await readBody(event)
    try {
      return await $fetch(`${SHIKI_BASE}/api/v2/user_rates/${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_rate: body }),
      })
    } catch (err: any) {
      throw createError({ statusCode: err?.statusCode || 502, statusMessage: 'Failed to update rate' })
    }
  }

  // ── DELETE ───────────────────────────────────────────────────────────────────
  if (method === 'DELETE') {
    const id = query.id
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing rate id' })
    try {
      await $fetch(`${SHIKI_BASE}/api/v2/user_rates/${id}`, {
        method: 'DELETE',
        headers,
      })
      return { ok: true }
    } catch (err: any) {
      throw createError({ statusCode: err?.statusCode || 502, statusMessage: 'Failed to delete rate' })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
