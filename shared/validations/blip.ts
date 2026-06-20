import { z } from 'zod'

export const createBlipSchema = z.object({
  name: z.string().min(1).max(80),
  quadrant: z.enum(['techniques', 'tools', 'platforms', 'languages']),
  ring: z.enum(['adopt', 'trial', 'assess', 'hold']),
  description: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
})

export const updateBlipSchema = createBlipSchema.partial()