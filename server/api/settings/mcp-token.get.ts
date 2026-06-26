export default defineEventHandler(async (event) => {
  if (!(await canEdit(event))) fail('Editing requires authentication', 403);
  if (!isSecure()) return ok({ token: null });
  return ok({ token: await getMcpToken() });
});
