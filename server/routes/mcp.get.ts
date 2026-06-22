// Stateless server has no GET event stream; the endpoint is POST-only.
export default defineEventHandler(() => {
  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
});
