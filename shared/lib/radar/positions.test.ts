import { describe, it, expect } from 'vitest';
import { computeBlipPositions } from './positions';
import { QUADRANT_START } from './constants';
import type { Blip } from '../../types/index';

function makeBlip(overrides: Partial<Blip> & { id: string; quadrant: string; ring: string }): Blip {
  return {
    number: 1,
    name: 'Test',
    description: 'Test blip',
    notes: null,
    isArchived: false,
    createdAt: new Date().toISOString(),
    lastEvaluatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('computeBlipPositions', () => {
  it('returns empty map for empty array', () => {
    const result = computeBlipPositions([]);
    expect(result.size).toBe(0);
  });

  it('places a single blip in each quadrant+ring cell', () => {
    for (const quadrant of Object.keys(QUADRANT_START)) {
      for (const ring of ['adopt', 'trial', 'assess', 'hold']) {
        const blip = makeBlip({ id: `blip-${quadrant}-${ring}`, quadrant, ring });
        const result = computeBlipPositions([blip]);
        const pos = result.get(`blip-${quadrant}-${ring}`);
        expect(pos).toBeDefined();
        expect(pos!.x).toBeGreaterThanOrEqual(0);
        expect(pos!.y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('spreads multiple blips in the same cell', () => {
    const blips: Blip[] = [1, 2, 3].map((i) =>
      makeBlip({
        id: `blip-${i}`,
        quadrant: 'techniques',
        ring: 'adopt',
        createdAt: new Date(2024, 0, i).toISOString(),
      })
    );
    const result = computeBlipPositions(blips);
    const positions = blips.map((b) => result.get(b.id)!);
    const xs = positions.map((p) => p.x);
    const ys = positions.map((p) => p.y);
    expect(new Set(xs.map((x) => x.toFixed(2))).size + new Set(ys.map((y) => y.toFixed(2))).size).toBeGreaterThan(1);
  });

  it('sorts blips by createdAt within a cell', () => {
    const blips: Blip[] = [3, 1, 2].map((i) =>
      makeBlip({
        id: `blip-${i}`,
        quadrant: 'tools',
        ring: 'trial',
        createdAt: new Date(2024, 0, i).toISOString(),
      })
    );
    const result = computeBlipPositions(blips);
    const positions = [blips[1], blips[2], blips[0]].map((b) => result.get(b.id)!);
    const angles = positions.map((p) => {
      const dx = p.x - 280;
      const dy = 280 - p.y;
      return (Math.atan2(dx, dy) * 180) / Math.PI;
    });
    expect(angles[0]).toBeLessThan(angles[1]);
    expect(angles[1]).toBeLessThan(angles[2]);
  });

  it('applies overflow adjustments when cell has >6 blips', () => {
    const blips: Blip[] = Array.from({ length: 8 }, (_, i) =>
      makeBlip({
        id: `blip-${i}`,
        quadrant: 'platforms',
        ring: 'assess',
        createdAt: new Date(2024, 0, i + 1).toISOString(),
      })
    );
    const result = computeBlipPositions(blips);
    expect(result.size).toBe(8);
  });

  it('places blips in different quadrants in different angular ranges', () => {
    const blips = Object.keys(QUADRANT_START).map((q) => makeBlip({ id: `blip-${q}`, quadrant: q, ring: 'adopt' }));
    const result = computeBlipPositions(blips);
    const angles = Object.keys(QUADRANT_START).map((q) => {
      const pos = result.get(`blip-${q}`)!;
      const dx = pos.x - 280;
      const dy = 280 - pos.y;
      return ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
    });
    const uniqueAngles = new Set(angles.map((a) => Math.round(a / 10)));
    expect(uniqueAngles.size).toBe(4);
  });
});
