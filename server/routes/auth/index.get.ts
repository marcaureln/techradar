export default defineEventHandler((event) => {
  const provider = activeProvider();
  return sendRedirect(event, provider ? `/auth/${provider}` : '/');
});
