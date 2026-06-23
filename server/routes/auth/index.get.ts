// /auth -> straight to the single configured provider (or home when insecure).
export default defineEventHandler((event) => {
  const provider = activeProvider();
  return sendRedirect(event, provider ? `/auth/${provider}` : '/');
});
