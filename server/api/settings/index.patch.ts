import { settingsSchema } from '#shared/validations/settings'

export default defineEventHandler(async (event) => {
  const data = await validateBody(event, settingsSchema)

  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: { companyName: data.companyName, ...(data.setupDone !== undefined ? { setupDone: data.setupDone } : {}) },
    create: { id: 'singleton', companyName: data.companyName, setupDone: data.setupDone ?? false },
  })

  return ok(settings)
})