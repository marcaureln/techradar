import type { H3Event } from 'h3';
import { getRouterParam } from 'h3';
import { prisma } from './db';
import { fail } from './response';

export const withHistory = { history: { orderBy: { changedAt: 'desc' } } } as const;

// Validate the :id param and load the blip, 404ing if it's missing.
export async function requireBlip(event: H3Event) {
  const id = getRouterParam(event, 'id');
  if (!id) fail('Missing id');
  const existing = await prisma.blip.findUnique({ where: { id } });
  if (!existing) fail('Blip not found', 404);
  return { id, existing };
}
