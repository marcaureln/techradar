export default defineEventHandler(async () => {
  // mcpToken is a secret served only via /api/settings/mcp-token; never expose it here.
  let settings = await prisma.settings.findUnique({ where: { id: 'singleton' }, omit: { mcpToken: true } });

  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 'singleton' }, omit: { mcpToken: true } });
  }

  return ok(settings);
});
