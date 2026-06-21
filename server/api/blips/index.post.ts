import { createBlipSchema } from '#shared/validations/blip'

export default defineEventHandler(async (event) => {
  const data = await validateBody(event, createBlipSchema)

  const maxNumber = await prisma.blip.aggregate({ _max: { number: true } })
  const number = (maxNumber._max.number ?? 0) + 1

  const blip = await prisma.blip.create({
    data: {
      number,
      name: data.name,
      quadrant: data.quadrant,
      ring: data.ring,
      description: data.description ?? '',
      notes: data.notes ?? null,
      ...(data.lastEvaluatedAt ? { lastEvaluatedAt: new Date(data.lastEvaluatedAt) } : {}),
    },
  })

  return ok(blip)
})