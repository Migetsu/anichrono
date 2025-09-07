// // /api/auth/logout.js
// export default function handler(req, res) {
//   res.setHeader('Content-Type', 'text/html; charset=utf-8');
//   res.end(`<!doctype html>
// <html><head><meta charset="utf-8"><title>Logout</title></head>
// <body>
// <script>
//   try { localStorage.removeItem('shikiToken'); } catch(e) {}
//   location.replace('/');
// </script>
// </body></html>`);
// }

// /api/auth/logout.js
export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html><head><meta charset="utf-8"><title>Logout</title></head>
<body>
<script>
  try {
    localStorage.removeItem('shiki_access_token');
    localStorage.removeItem('shikiToken');
  } catch(e) {}
  location.replace('/');
</script>
</body></html>`);
}
