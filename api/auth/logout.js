export default function handler(req, res) {
  console.log('Auth logout: start');
  let redirect = '/';
  try {
    if (req.headers.referer) {
      redirect = new URL(req.headers.referer).origin;
    }
  } catch (e) {
    console.error('Auth logout: failed to parse referer', e);
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<script>
    localStorage.removeItem('shikiToken');
    localStorage.removeItem('shikiRefreshToken');
    window.location.href = ${JSON.stringify(redirect)};
  </script>`);
}
