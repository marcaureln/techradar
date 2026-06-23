import { updateBlipSchema } from '#shared/validations/blip';

export default defineEventHandler(async (event) => {
  const { id, existing } = await requireBlip(event);
  const data = await validateBody(event, updateBlipSchema);

  const ringChanged = data.ring !== undefined && data.ring !== existing.ring;

  const blip = await prisma.blip.update({
    where: { id },
    data: {
      ...data,
      notes: data.notes ?? undefined,
      ...(ringChanged
        ? {
            lastEvaluatedAt: new Date(),
            history: {
              create: {
                fromRing: existing.ring,
                toRing: data.ring,
                changedBy: await getCallerUsername(event),
              },
            },
          }
        : {}),
    },
    include: withHistory,
  });

  return ok(blip);
});
