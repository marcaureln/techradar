export default defineEventHandler(async (event) => {
  const { id, existing } = await requireBlip(event);

  const blip = await prisma.blip.update({
    where: { id },
    data: {
      lastEvaluatedAt: new Date(),
      history: {
        create: {
          fromRing: existing.ring,
          toRing: existing.ring,
          changedBy: await getCallerUsername(event),
        },
      },
    },
    include: withHistory,
  });

  return ok(blip);
});
