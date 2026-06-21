import { z } from 'zod'

export const settingsSchema = z.object({
  setupDone: z.boolean().optional(),
})