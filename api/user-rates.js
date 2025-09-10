export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || ''
    if (!auth.startsWith('Bearer ')) {
      res.statusCode = 401
      return res.json({ error: 'No bearer token' })
    }
    const url = new URL(req.url, 'http://localhost')
    if (req.method === 'GET') {
      const userId = url.searchParams.get('user_id')
      const r = await fetch(`https://shikimori.one/api/users/${userId}/anime_rates`, {
        headers: { Authorization: auth }
      })
      const data = await r.json()
      res.statusCode = r.status
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(data))
    }
    let body = ''
    req.on('data', c => body += c)
    await new Promise(resolve => req.on('end', resolve))
    if (req.method === 'POST') {
      const r = await fetch('https://shikimori.one/api/v2/user_rates', {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body
      })
      const data = await r.json()
      res.statusCode = r.status
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'PUT') {
      const id = url.searchParams.get('id')
      const r = await fetch(`https://shikimori.one/api/v2/user_rates/${id}`, {
        method: 'PUT',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body
      })
      const data = await r.json()
      res.statusCode = r.status
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id')
      const r = await fetch(`https://shikimori.one/api/v2/user_rates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: auth }
      })
      res.statusCode = r.status
      const data = await r.text()
      res.setHeader('Content-Type', 'application/json')
      return res.end(data)
    }
    res.statusCode = 405
    res.end('Method not allowed')
  } catch (e) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: String(e.message || e) }))
  }
}
