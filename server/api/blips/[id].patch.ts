import { updateBlipSchema } from '#shared/validations/blip'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) fail('Missing id')

  const data = await validateBody(event, updateBlipSchema)

  const existing = await prisma.blip.findUnique({ where: { id } })
  if (!existing) fail('Blip not found', 404)

  const ringChanged = data.ring !== undefined && data.ring !== existing.ring

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
                changedBy: getCallerUsername(event),
              },
            },
          }
        : {}),
    },
    include: { history: { orderBy: { changedAt: 'desc' } } },
  })

  return ok(blip)
})