import { defineEventHandler, readBody, createError, getQuery, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const token = getCookie(event, 'shiki_token')
  
  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'User-Agent': process.env.SHIKI_USER_AGENT || 'anichrono'
  }

  try {
    if (method === 'POST') {
      const body = await readBody(event)
      const res = await $fetch('https://shikimori.io/api/v2/user_rates', {
        method: 'POST',
        headers,
        body: { user_rate: body }
      })
      return res
    }
    
    if (method === 'PATCH' || method === 'PUT') {
      const body = await readBody(event)
      // Extract rate ID and remove it from the body payload
      const id = body.id
      delete body.id
      
      if (!id) throw createError({ statusCode: 400, message: 'Missing rate ID' })
      
      const res = await $fetch(`https://shikimori.io/api/v2/user_rates/${id}`, {
        method: 'PATCH', // v2 supports PATCH
        headers,
        body: { user_rate: body }
      })
      return res
    }
    
    if (method === 'DELETE') {
      const query = getQuery(event)
      const id = query.id
      if (!id) throw createError({ statusCode: 400, message: 'Missing rate ID' })
      
      const res = await $fetch(`https://shikimori.io/api/v2/user_rates/${id}`, {
        method: 'DELETE',
        headers
      })
      return { success: true }
    }
    
    throw createError({ statusCode: 405, message: 'Method Not Allowed' })
  } catch (err: any) {
    console.error(`[API] Shikimori /user_rates ${method} failed:`, err.data || err.message)
    throw createError({
      statusCode: err.response?.status || err.statusCode || 500,
      message: err.data?.message || err.message || 'Internal Server Error'
    })
  }
})
