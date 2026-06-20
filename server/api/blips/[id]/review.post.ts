
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) fail('Missing id')

  const existing = await prisma.blip.findUnique({ where: { id } })
  if (!existing) fail('Blip not found', 404)

  const blip = await prisma.blip.update({
    where: { id },
    data: {
      lastEvaluatedAt: new Date(),
      history: {
        create: {
          fromRing: existing.ring,
          toRing: existing.ring,
          changedBy: getCallerUsername(event),
        },
      },
    },
    include: { history: { orderBy: { changedAt: 'desc' } } },
  })

  return ok(blip)
})