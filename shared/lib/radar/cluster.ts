export interface BlipCluster<T> {
  x: number;
  y: number;
  blips: T[];
}

const MERGE_DIST = 24;

export function clusterBlips<T extends { id: string }>(
  blips: T[],
  positions: Map<string, { x: number; y: number }>,
  scale: number
): BlipCluster<T>[] {
  const threshold = MERGE_DIST / Math.max(scale, 0.0001);
  const thresholdSq = threshold * threshold;
  const clusters: { x: number; y: number; sumX: number; sumY: number; blips: T[] }[] = [];

  for (const blip of blips) {
    const p = positions.get(blip.id);
    if (!p) continue;
    let merged = false;
    for (const c of clusters) {
      const dx = c.x - p.x;
      const dy = c.y - p.y;
      if (dx * dx + dy * dy <= thresholdSq) {
        c.blips.push(blip);
        c.sumX += p.x;
        c.sumY += p.y;
        c.x = c.sumX / c.blips.length;
        c.y = c.sumY / c.blips.length;
        merged = true;
        break;
      }
    }
    if (!merged) clusters.push({ x: p.x, y: p.y, sumX: p.x, sumY: p.y, blips: [blip] });
  }

  return clusters.map((c) => ({ x: c.x, y: c.y, blips: c.blips }));
}
