export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html><html><body><script>
    try { localStorage.removeItem('shiki_access_token'); localStorage.removeItem('shikiToken'); } catch(e) {}
    location.replace('/');
  </script></body></html>`);
}
