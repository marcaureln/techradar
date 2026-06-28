import { describe, it, expect } from 'vitest';
import { clusterBlips } from './cluster';

const b = (id: string) => ({ id });

describe('clusterBlips', () => {
  it('merges blips within the threshold at scale 1', () => {
    const positions = new Map([
      ['a', { x: 100, y: 100 }],
      ['b', { x: 116, y: 100 }], // 16 apart < 18 -> merge
      ['c', { x: 300, y: 300 }],
    ]);
    const clusters = clusterBlips([b('a'), b('b'), b('c')], positions, 1);
    expect(clusters).toHaveLength(2);
    const big = clusters.find((c) => c.blips.length === 2)!;
    expect(big.blips.map((x) => x.id).sort()).toEqual(['a', 'b']);
  });

  it('splits when zoomed in (higher scale shrinks the threshold)', () => {
    const positions = new Map([
      ['a', { x: 100, y: 100 }],
      ['b', { x: 120, y: 100 }], // 20 apart; scale 2 -> threshold 9 -> separate
    ]);
    expect(clusterBlips([b('a'), b('b')], positions, 2)).toHaveLength(2);
  });

  it('cluster centroid is the mean of its members', () => {
    const positions = new Map([
      ['a', { x: 100, y: 100 }],
      ['b', { x: 110, y: 100 }],
    ]);
    const [c] = clusterBlips([b('a'), b('b')], positions, 1);
    expect(c.x).toBe(105);
    expect(c.y).toBe(100);
  });

  it('stops clustering once zoomed past the cutoff', () => {
    const positions = new Map([
      ['a', { x: 100, y: 100 }],
      ['b', { x: 104, y: 100 }], // 4 apart, but scale 3 disables clustering
    ]);
    expect(clusterBlips([b('a'), b('b')], positions, 3)).toHaveLength(2);
  });

  it('ignores blips without a position', () => {
    const positions = new Map([['a', { x: 0, y: 0 }]]);
    const clusters = clusterBlips([b('a'), b('missing')], positions, 1);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]!.blips).toHaveLength(1);
  });
});
