import { computed } from 'vue';

export function useMarkerStyle(p: { x: number; y: number; scale?: number }) {
  return computed(() => ({
    transform: `scale(${1 / (p.scale || 1)})`,
    transformBox: 'view-box' as const,
    transformOrigin: `${p.x}px ${p.y}px`,
  }));
}
