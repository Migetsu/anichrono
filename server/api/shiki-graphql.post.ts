export default defineEventHandler(async (event) => {
  const body = await readBody<{ query: string; variables?: Record<string, unknown> }>(event)

  if (!body?.query) {
    throw createError({ statusCode: 400, statusMessage: 'Missing GraphQL query' })
  }

  try {
    const response = await $fetch<any>('https://shikimori.io/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AniChrono/1.0',
      },
      body: { query: body.query, variables: body.variables },
    })

    return response
  } catch (err: any) {
    const status = err?.statusCode || err?.status || 500
    throw createError({
      statusCode: status,
      statusMessage: status === 429
        ? 'Rate limit exceeded'
        : `Shikimori GraphQL error: ${err.message || 'Unknown'}`,
    })
  }
})
