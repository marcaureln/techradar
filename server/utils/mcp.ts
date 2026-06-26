import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createBlipSchema, updateBlipSchema } from '#shared/validations/blip';
import { QUADRANT_KEYS, RING_KEYS } from '#shared/types';
import { QUADRANT_LABELS, RING_LABELS } from '#shared/lib/radar/constants';
import { isDue, daysUntilDue } from '#shared/lib/radar/review';
import type { BlipWithHistory } from '#shared/types';
import { prisma } from './db';
import { createBlip, updateBlip, markReviewed, archiveBlip, restoreBlip } from './blip';

const json = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });

type BlipSummary = Pick<BlipWithHistory, 'id' | 'number' | 'name' | 'quadrant' | 'ring' | 'isArchived'>;
const summary = (b: BlipSummary) => ({
  id: b.id,
  number: b.number,
  name: b.name,
  quadrant: b.quadrant,
  ring: b.ring,
  isArchived: b.isArchived,
});

const detail = (b: BlipWithHistory) => ({
  ...summary(b),
  description: b.description,
  notes: b.notes,
  createdAt: b.createdAt,
  lastEvaluatedAt: b.lastEvaluatedAt,
  dueForReview: isDue(b),
  history: b.history,
});

function listBlips(archived = false) {
  return $fetch<{ data: BlipWithHistory[] }>('/api/blips', {
    params: archived ? { archived: 'true' } : {},
  }).then((r) => r.data);
}

export function buildMcpServer({ canWrite = false }: { canWrite?: boolean } = {}) {
  const server = new McpServer({ name: 'techradar', version: '1.0.0' });

  server.registerTool(
    'list_blips',
    {
      description: 'List radar blips, optionally filtered by quadrant, ring, or archived state.',
      inputSchema: {
        archived: z.boolean().optional().describe('List archived blips instead of active ones'),
        quadrant: createBlipSchema.shape.quadrant.optional(),
        ring: createBlipSchema.shape.ring.optional(),
      },
    },
    async ({ archived, quadrant, ring }) => {
      let blips = await listBlips(archived ?? false);
      if (quadrant) blips = blips.filter((b) => b.quadrant === quadrant);
      if (ring) blips = blips.filter((b) => b.ring === ring);
      return json(blips.map(summary));
    }
  );

  server.registerTool(
    'get_blip',
    {
      description: 'Get a single blip with its full ring-change history, by id or number.',
      inputSchema: {
        id: z.string().optional(),
        number: z.number().int().positive().optional(),
      },
    },
    async ({ id, number }) => {
      if (id) {
        const r = await $fetch<{ data: BlipWithHistory }>(`/api/blips/${id}`);
        return json(detail(r.data));
      }
      if (number) {
        const blip =
          (await listBlips()).find((b) => b.number === number) ??
          (await listBlips(true)).find((b) => b.number === number);
        return json(blip ? detail(blip) : { error: `No blip #${number}` });
      }
      return json({ error: 'Provide an id or a number.' });
    }
  );

  server.registerTool(
    'search_blips',
    {
      description: 'Search active blips by name or description (case-insensitive).',
      inputSchema: { query: z.string().min(1) },
    },
    async ({ query }) => {
      const q = query.toLowerCase();
      const blips = (await listBlips()).filter(
        (b) => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
      );
      return json(blips.map(summary));
    }
  );

  server.registerTool(
    'blips_due_for_review',
    {
      description: 'List active blips past the 90-day review window, most overdue first.',
      inputSchema: {},
    },
    async () => {
      const due = (await listBlips())
        .filter((b) => isDue(b))
        .map((b) => ({ ...summary(b), daysOverdue: -daysUntilDue(b), lastEvaluatedAt: b.lastEvaluatedAt }))
        .sort((a, b) => b.daysOverdue - a.daysOverdue);
      return json(due);
    }
  );

  server.registerTool(
    'radar_overview',
    {
      description: 'Counts of active blips per quadrant and ring, plus the radar taxonomy (labels).',
      inputSchema: {},
    },
    async () => {
      const blips = await listBlips();
      return json({
        total: blips.length,
        quadrants: QUADRANT_KEYS.map((q) => ({
          key: q,
          label: QUADRANT_LABELS[q],
          count: blips.filter((b) => b.quadrant === q).length,
        })),
        rings: RING_KEYS.map((r) => ({
          key: r,
          label: RING_LABELS[r],
          count: blips.filter((b) => b.ring === r).length,
        })),
      });
    }
  );

  if (canWrite) registerWriteTools(server);

  return server;
}

function registerWriteTools(server: McpServer) {
  server.registerTool(
    'create_blip',
    { description: 'Create a new blip.', inputSchema: createBlipSchema.shape },
    async (input) => json(summary(await createBlip(input)))
  );

  server.registerTool(
    'update_blip',
    {
      description: 'Update a blip by id. Changing the ring records a history entry.',
      inputSchema: { id: z.string(), ...updateBlipSchema.shape },
    },
    async ({ id, ...data }) => {
      const existing = await prisma.blip.findUnique({ where: { id } });
      if (!existing) return json({ error: `No blip ${id}` });
      return json(summary(await updateBlip(id, existing.ring, data, 'mcp')));
    }
  );

  server.registerTool(
    'mark_blip_reviewed',
    {
      description: 'Mark a blip reviewed as of now (records a no-change history entry).',
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      const existing = await prisma.blip.findUnique({ where: { id } });
      if (!existing) return json({ error: `No blip ${id}` });
      return json(summary(await markReviewed(id, existing.ring, 'mcp')));
    }
  );

  server.registerTool(
    'archive_blip',
    { description: 'Archive (soft-delete) a blip by id.', inputSchema: { id: z.string() } },
    async ({ id }) => {
      const existing = await prisma.blip.findUnique({ where: { id } });
      if (!existing) return json({ error: `No blip ${id}` });
      return json(summary(await archiveBlip(id)));
    }
  );

  server.registerTool(
    'restore_blip',
    { description: 'Restore an archived blip by id.', inputSchema: { id: z.string() } },
    async ({ id }) => {
      const existing = await prisma.blip.findUnique({ where: { id } });
      if (!existing) return json({ error: `No blip ${id}` });
      return json(summary(await restoreBlip(id)));
    }
  );
}
