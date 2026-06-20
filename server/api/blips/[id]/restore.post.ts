
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) fail('Missing id')

  const existing = await prisma.blip.findUnique({ where: { id } })
  if (!existing) fail('Blip not found', 404)

  const blip = await prisma.blip.update({
    where: { id },
    data: { isArchived: false },
  })

  return ok(blip)
})