import { computed } from 'vue';

// Counter-scales a radar marker so it stays a constant on-screen size while the
// chart zooms, pinned to its (x, y) in view-box space.
export function useMarkerStyle(p: { x: number; y: number; scale?: number }) {
  return computed(() => ({
    transform: `scale(${1 / (p.scale || 1)})`,
    transformBox: 'view-box' as const,
    transformOrigin: `${p.x}px ${p.y}px`,
  }));
}
