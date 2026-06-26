export default defineEventHandler(async () => {
  if (!isSecure()) fail('MCP tokens are only available in secure mode', 400);
  const token = generateMcpToken();
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: { mcpToken: token },
    create: { id: 'singleton', mcpToken: token },
  });
  return ok({ token });
});
