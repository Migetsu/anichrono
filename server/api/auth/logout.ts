export default defineEventHandler(async (event) => {
  // Clear cookies
  deleteCookie(event, 'shiki_token')
  deleteCookie(event, 'shiki_refresh')
  deleteCookie(event, 'shiki_session')

  // Redirect to home
  return sendRedirect(event, '/')
})