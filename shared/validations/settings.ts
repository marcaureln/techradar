import { z } from 'zod';

export const settingsSchema = z.object({
  setupDone: z.boolean().optional(),
  name: z.string().max(80).optional(),
  description: z.string().max(300).optional(),
  mcpEnabled: z.boolean().optional(),
});
