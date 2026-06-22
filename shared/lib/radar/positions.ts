import type { Blip } from '../../types/index';
import { QUADRANT_START, RING_OUTER, RING_INDEX, CX, CY } from './constants';

const QUADRANT_PAD_DEG = 12; // gap from the quadrant's leading edge before the first blip
const QUADRANT_SPAN_DEG = 66; // usable arc inside the 90deg quadrant
const RING_GAP = 6; // gap kept between adjacent rings
const INNER_START = 10; // start radius for the innermost ring
const CROWD_THRESHOLD = 6; // above this many blips in a cell, jitter to reduce overlap
const ANGLE_JITTER = 4;
const RADIUS_JITTER = 4;

function polarToXY(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
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
    const rInner = rIdx === 0 ? INNER_START : RING_OUTER[rIdx - 1] + RING_GAP;
    const rOuter = RING_OUTER[rIdx];

    const n = sorted.length;

    for (let i = 0; i < n; i++) {
      const blip = sorted[i];
      let angle = QUADRANT_START[quadrant] + QUADRANT_PAD_DEG + ((i + 1) * QUADRANT_SPAN_DEG) / (n + 1);
      let radius = rInner + ((i + 1) * (rOuter - RING_GAP - rInner)) / (n + 1);

      if (n > CROWD_THRESHOLD) {
        angle += ((i % 3) - 1) * ANGLE_JITTER;
        radius += (i % 2) * RADIUS_JITTER;
      }

      result.set(blip.id, polarToXY(angle, radius));
    }
  }

  return result;
}
