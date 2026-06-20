
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) fail('Missing id')

  const blip = await prisma.blip.findUnique({
    where: { id },
    include: { history: { orderBy: { changedAt: 'desc' } } },
  })

  if (!blip) fail('Blip not found', 404)

  return ok(blip)
})