import type { H3Event } from 'h3';
import { getRouterParam } from 'h3';
import { prisma } from './db';
import { fail } from './response';
import type { CreateBlipInput, UpdateBlipInput } from '#shared/types';

export const withHistory = { history: { orderBy: { changedAt: 'desc' } } } as const;

export async function requireBlip(event: H3Event) {
  const id = getRouterParam(event, 'id');
  if (!id) fail('Missing id');
  const existing = await prisma.blip.findUnique({ where: { id } });
  if (!existing) fail('Blip not found', 404);
  return { id, existing };
}

export async function createBlip(input: CreateBlipInput) {
  const { _max } = await prisma.blip.aggregate({ _max: { number: true } });
  return prisma.blip.create({
    data: {
      number: (_max.number ?? 0) + 1,
      name: input.name,
      quadrant: input.quadrant,
      ring: input.ring,
      description: input.description ?? '',
      notes: input.notes ?? null,
      ...(input.lastEvaluatedAt ? { lastEvaluatedAt: new Date(input.lastEvaluatedAt) } : {}),
    },
  });
}

export async function updateBlip(id: string, fromRing: string, input: UpdateBlipInput, changedBy: string) {
  const ringChanged = input.ring !== undefined && input.ring !== fromRing;
  const { lastEvaluatedAt, ...data } = input;
  return prisma.blip.update({
    where: { id },
    data: {
      ...data,
      notes: input.notes ?? undefined,
      ...(lastEvaluatedAt ? { lastEvaluatedAt: new Date(lastEvaluatedAt) } : {}),
      ...(ringChanged
        ? {
            lastEvaluatedAt: new Date(),
            history: { create: { fromRing, toRing: input.ring!, changedBy } },
          }
        : {}),
    },
    include: withHistory,
  });
}

export async function markReviewed(id: string, ring: string, changedBy: string) {
  return prisma.blip.update({
    where: { id },
    data: {
      lastEvaluatedAt: new Date(),
      history: { create: { fromRing: ring, toRing: ring, changedBy } },
    },
    include: withHistory,
  });
}

export function archiveBlip(id: string) {
  return prisma.blip.update({ where: { id }, data: { isArchived: true } });
}

export function restoreBlip(id: string) {
  return prisma.blip.update({ where: { id }, data: { isArchived: false } });
}
