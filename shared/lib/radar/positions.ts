import type { Blip } from '../../types/index';
import { QUADRANT_START, RING_OUTER, RING_INDEX, CX } from './constants';

function polarToXY(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: 280 - r * Math.cos(rad) };
}

export function computeBlipPositions(blips: Blip[]): Map<string, { x: number; y: number }> {
  const result = new Map<string, { x: number; y: number }>();

  const cells = new Map<string, Blip[]>();
  for (const blip of blips) {
    const key = `${blip.quadrant}:${blip.ring}`;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key)!.push(blip);
  }

  for (const [key, cellBlips] of cells) {
    const sorted = [...cellBlips].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const [quadrant, ring] = key.split(':');
    const rIdx = RING_INDEX[ring];
    const rInner = rIdx === 0 ? 10 : RING_OUTER[rIdx - 1] + 6;
    const rOuter = RING_OUTER[rIdx];

    const n = sorted.length;

    for (let i = 0; i < n; i++) {
      const blip = sorted[i];
      let angle = QUADRANT_START[quadrant] + 12 + (i + 1) * (66 / (n + 1));
      let radius = rInner + (i + 1) * ((rOuter - 6 - rInner) / (n + 1));

      if (n > 6) {
        angle += ((i % 3) - 1) * 4;
        radius += (i % 2) * 4;
      }

      const pos = polarToXY(angle, radius);
      result.set(blip.id, pos);
    }
  }

  return result;
}
