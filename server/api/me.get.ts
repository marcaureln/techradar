export default defineEventHandler(async (event) => {
  const user = await sessionUser(event);
  return ok({
    secure: isSecure(),
    provider: activeProvider(),
    user,
    canEdit: await canEdit(event),
    mcpEnabled: await mcpEnabled(),
  });
});
