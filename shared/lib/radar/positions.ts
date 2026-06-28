import type { Blip } from '../../types/index';
import { QUADRANT_START, RING_OUTER, RING_INDEX, CX, CY } from './constants';

const QUADRANT_PAD_DEG = 12; // gap from the quadrant's leading edge before the first blip
const QUADRANT_SPAN_DEG = 66; // usable arc inside the 90deg quadrant
const RING_GAP = 6; // gap kept between adjacent rings
const INNER_START = 10; // start radius for the innermost ring
const JITTER = 0.7; // how far a blip may wander within its own stratum

function polarToXY(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand01(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function stratum(index: number, n: number, r: number) {
  return (index + 0.5 + (r - 0.5) * JITTER) / n;
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
    const n = sorted.length;

    const [quadrant, ring] = key.split(':');
    const rIdx = RING_INDEX[ring];
    const rInner = rIdx === 0 ? INNER_START : RING_OUTER[rIdx - 1] + RING_GAP;
    const rOuter = RING_OUTER[rIdx] - RING_GAP;

    const radiusRank = new Map([...sorted].sort((a, b) => hash(a.id) - hash(b.id)).map((b, j) => [b.id, j]));

    for (let i = 0; i < n; i++) {
      const blip = sorted[i];
      const aFrac = stratum(i, n, rand01(hash(`${blip.id}:a`)));
      const rFrac = stratum(radiusRank.get(blip.id)!, n, rand01(hash(`${blip.id}:r`)));

      const angle = QUADRANT_START[quadrant] + QUADRANT_PAD_DEG + aFrac * QUADRANT_SPAN_DEG;
      const radius = Math.sqrt(rInner * rInner + rFrac * (rOuter * rOuter - rInner * rInner));

      result.set(blip.id, polarToXY(angle, radius));
    }
  }

  return result;
}
