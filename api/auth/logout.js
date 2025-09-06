export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<script>
    localStorage.removeItem('shikiToken');
    localStorage.removeItem('shikiRefreshToken');
    window.location.href = '/';
  </script>`);
}
