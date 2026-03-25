export default defineEventHandler(async (event) => {
  // Clear cookies
  deleteCookie(event, 'shiki_token')
  deleteCookie(event, 'shiki_token_client') // Clean up old one just in case
  deleteCookie(event, 'shiki_session')

  // Redirect to home
  return sendRedirect(event, '/')
})