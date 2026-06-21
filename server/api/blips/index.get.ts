export default defineEventHandler(async (event) => {
  const { archived } = getQuery(event);
  const blips = await prisma.blip.findMany({
    where: { isArchived: archived === 'true' },
    include: { history: { orderBy: { changedAt: 'desc' } } },
    orderBy: { createdAt: 'asc' },
  });
  return ok(blips);
});
