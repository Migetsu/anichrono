


export default async function handler(req, res) {
  try {
    
    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
    
    
    
    res.redirect(frontendOrigin);
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).send('Server error');
  }
}

