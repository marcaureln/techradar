import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import type { Quadrant } from '#shared/types'


const FOCUS_SCALE = 1.85
const FOCUS_POINT: Record<Quadrant, { cx: number; cy: number }> = {
  techniques: { cx: 380, cy: 180 }, // NE
  languages: { cx: 380, cy: 380 }, // SE
  platforms: { cx: 180, cy: 380 }, // SW
  tools: { cx: 180, cy: 180 }, // NW
}
const MIN_SCALE = 0.8
const MAX_SCALE = 6
const CENTER = 280

interface View {
  scale: number
  tx: number
  ty: number
}

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

const view = useStorage<View>('techradar:view', { scale: 1, tx: 0, ty: 0 })
const focused = useStorage<Quadrant | null>('techradar:focus', null)
const hoveredId = ref<string | null>(null)
const animating = ref(false)
let animTimer: ReturnType<typeof setTimeout> | undefined

function commit(next: View, animate = false) {
  animating.value = animate
  view.value = { scale: clampScale(next.scale), tx: next.tx, ty: next.ty }
  if (animate) {
    clearTimeout(animTimer)
    animTimer = setTimeout(() => (animating.value = false), 420)
  }
}

function zoomAt(point: { x: number; y: number }, factor: number) {
  const s = view.value.scale
  const s2 = clampScale(s * factor)
  if (s2 === s) return
  commit({
    scale: s2,
    tx: point.x - (s2 * (point.x - view.value.tx)) / s,
    ty: point.y - (s2 * (point.y - view.value.ty)) / s,
  })
}

function zoomByButton(factor: number) {
  zoomAt({ x: CENTER, y: CENTER }, factor)
}

function panBy(dx: number, dy: number) {
  commit({ scale: view.value.scale, tx: view.value.tx + dx, ty: view.value.ty + dy })
}

function focusQuadrant(q: Quadrant | null) {
  if (!q) return reset()
  focused.value = q
  const { cx, cy } = FOCUS_POINT[q]
  commit({ scale: FOCUS_SCALE, tx: CENTER - FOCUS_SCALE * cx, ty: CENTER - FOCUS_SCALE * cy }, true)
}

function reset() {
  focused.value = null
  commit({ scale: 1, tx: 0, ty: 0 }, true)
}

export function useRadarView() {
  return { view, focused, hoveredId, animating, zoomAt, zoomByButton, panBy, focusQuadrant, reset }
}
