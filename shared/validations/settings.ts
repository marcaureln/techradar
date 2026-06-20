import { z } from 'zod'

export const settingsSchema = z.object({
  companyName: z.string().min(1).max(80),
  setupDone: z.boolean().optional(),
})