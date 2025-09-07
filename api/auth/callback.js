// // /api/auth/callback.js
// export default async function handler(req, res) {
//   try {
//     const url = new URL(req.url, `http://${req.headers.host}`);
//     const code = url.searchParams.get('code');
//     if (!code) { res.statusCode = 400; return res.end('Missing code'); }

//     const body = new URLSearchParams({
//       grant_type: 'authorization_code',
//       client_id: process.env.SHIKI_CLIENT_ID,
//       client_secret: process.env.SHIKI_CLIENT_SECRET,
//       redirect_uri: process.env.SHIKI_REDIRECT_URI,
//       code
//     });

//     const r = await fetch('https://shikimori.one/oauth/token', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
//       body
//     });
//     const data = await r.json();
//     if (!r.ok || !data.access_token) {
//       res.statusCode = r.status || 500;
//       return res.end(`Token exchange failed: ${JSON.stringify(data)}`);
//     }

//     let frontendOrigin = process.env.FRONTEND_ORIGIN;
//     if (!frontendOrigin) {
//       if (req.headers.host && req.headers.host.includes('localhost')) {
//         frontendOrigin = 'http://localhost:5173';
//       } else {
//         const proto = req.headers['x-forwarded-proto'] || 'https';
//         frontendOrigin = `${proto}://${req.headers.host}`;
//       }
//     }
//     // 302 на фронт, токен в hash (не уходит на сервер)
//     res.setHeader('Content-Type', 'text/html; charset=utf-8');
//     res.end(`<!doctype html>
// <html><head><meta charset="utf-8"><title>Auth Callback</title></head>
// <body>
// <script>
//   try { localStorage.setItem('shikiToken', ${JSON.stringify(data.access_token)}); } catch(e) {}
//   const frontendOrigin = ${JSON.stringify(frontendOrigin)};
//   location.replace(frontendOrigin);
// </script>
// </body></html>`);
//   } catch (e) {
//     res.statusCode = 500;
//     res.end(String(e?.message || e));
//   }
// }

// /api/auth/callback.js
export default async function handler(req, res) {
  try {
    // На Vercel req.url — относительный путь, поэтому задаём базу из заголовков
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = new URL(req.url, `${proto}://${host}`);

    // 1) Забираем code и (опционально) state
    const code = url.searchParams.get('code');
    const oauthError = url.searchParams.get('error');
    const oauthErrorDesc = url.searchParams.get('error_description');

    if (oauthError) {
      res.statusCode = 400;
      return res.end(`OAuth error: ${oauthError} ${oauthErrorDesc ? `- ${oauthErrorDesc}` : ''}`);
    }

    if (!code) {
      res.statusCode = 400;
      return res.end('Missing code');
    }

    // 2) Меняем code на токен
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SHIKI_CLIENT_ID,
      client_secret: process.env.SHIKI_CLIENT_SECRET,
      redirect_uri: process.env.SHIKI_REDIRECT_URI, // ДОЛЖЕН совпадать с URL этого обработчика
      code
    });

    const tokenResp = await fetch('https://shikimori.one/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    });

    const data = await tokenResp.json();

    if (!tokenResp.ok || !data.access_token) {
      res.statusCode = tokenResp.status || 500;
      return res.end(`Token exchange failed: ${JSON.stringify(data)}`);
    }

    // 3) Редиректим на фронт. Используем "/#access_token=..."
    // чтобы SPA не пыталась сматчить несуществующий роут "/auth/callback"
    const FRONT = process.env.FRONTEND_ORIGIN || 'https://anichrono.vercel.app';
    const location = `${FRONT}/#access_token=${encodeURIComponent(data.access_token)}`;

    res.writeHead(302, { Location: location });
    res.end();
  } catch (e) {
    res.statusCode = 500;
    res.end(`Internal error: ${e?.message || e}`);
  }
}
