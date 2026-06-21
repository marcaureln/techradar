
export default defineEventHandler(async () => {
  let settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 'singleton' },
    })
  }

  return ok(settings)
})