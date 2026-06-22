import { settingsSchema } from '#shared/validations/settings';

export default defineEventHandler(async (event) => {
  const data = await validateBody(event, settingsSchema);

  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {
      ...(data.setupDone !== undefined ? { setupDone: data.setupDone } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
    create: {
      id: 'singleton',
      setupDone: data.setupDone ?? false,
      name: data.name ?? null,
      description: data.description ?? null,
    },
  });

  return ok(settings);
});
