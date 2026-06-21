<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { AnimatePresence } from 'motion-v'
import { computeBlipPositions } from '#shared/lib/radar/positions'
import { QUADRANT_COLORS, QUADRANT_LABELS, QUADRANT_START, RING_OUTER, CX, CY, RMAX } from '#shared/lib/radar/constants'
import { clusterBlips } from '#shared/lib/radar/cluster'
import { blipDirection } from '#shared/lib/radar/direction'
import type { BlipWithHistory, Quadrant } from '#shared/types'

const CACHE_KEY = 'techradar:blip-positions'

const props = defineProps<{
  blips: BlipWithHistory[]
}>()

const emit = defineEmits<{
  select: [blip: BlipWithHistory]
}>()

const { view, focused, hoveredId, animating, zoomAt, panBy, focusQuadrant } = useRadarView()

const filteredBlips = computed(() =>
  focused.value ? props.blips.filter((b) => b.quadrant === focused.value) : props.blips,
)

const positions = computed(() => computeBlipPositions(filteredBlips.value))

const { useClusters, hideSidebar } = useRadarSettings()
const clusters = computed(() =>
  useClusters.value
    ? clusterBlips(filteredBlips.value, positions.value, view.value.scale)
    : filteredBlips.value.map((b) => {
        const p = positions.value.get(b.id) ?? { x: CX, y: CY }
        return { x: p.x, y: p.y, blips: [b] }
      }),
)
const singles = computed(() => clusters.value.filter((c) => c.blips.length === 1))
const groups = computed(() => clusters.value.filter((c) => c.blips.length > 1))

const hoveredBlip = computed(() =>
  hoveredId.value ? filteredBlips.value.find((b) => b.id === hoveredId.value) ?? null : null,
)
const hoveredPos = computed(() =>
  hoveredId.value ? positions.value.get(hoveredId.value) ?? null : null,
)

const prevPositions = ref<Record<string, { x: number; y: number }>>({})

onMounted(() => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) prevPositions.value = JSON.parse(cached)
  } catch {}
})

function persistPositions() {
  const next: Record<string, { x: number; y: number }> = {}
  positions.value.forEach((pos, id) => {
    next[id] = pos
  })
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(next))
  } catch {}
}

watch(positions, () => {
  nextTick(() => persistPositions())
})

const svgEl = ref<SVGSVGElement | null>(null)

function toViewbox(clientX: number, clientY: number) {
  const r = svgEl.value!.getBoundingClientRect()
  return { x: (clientX - r.left) * (560 / r.width), y: (clientY - r.top) * (560 / r.height) }
}

function onWheel(e: WheelEvent) {
  zoomAt(toViewbox(e.clientX, e.clientY), e.deltaY < 0 ? 1.12 : 1 / 1.12)
}

const dragging = ref(false)
let moved = false
let last = { x: 0, y: 0 }

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  dragging.value = true
  moved = false
  last = { x: e.clientX, y: e.clientY }
}
function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const r = svgEl.value!.getBoundingClientRect()
  const f = 560 / r.width
  const dx = e.clientX - last.x
  const dy = e.clientY - last.y
  if (Math.abs(dx) + Math.abs(dy) > 2) moved = true
  panBy(dx * f, dy * f)
  last = { x: e.clientX, y: e.clientY }
}
function onPointerUp() {
  dragging.value = false
}

const transform = computed(
  () => `translate(${view.value.tx}px, ${view.value.ty}px) scale(${view.value.scale})`,
)

function handleBlipClick(blip: BlipWithHistory) {
  if (moved) return
  emit('select', blip)
}

function quadrantArc(q: Quadrant): string {
  const start = QUADRANT_START[q]
  const r = RMAX
  const startRad = ((start - 90) * Math.PI) / 180
  const endRad = ((start + 90 - 90) * Math.PI) / 180
  const x1 = CX + r * Math.cos(startRad)
  const y1 = CY + r * Math.sin(startRad)
  const x2 = CX + r * Math.cos(endRad)
  const y2 = CY + r * Math.sin(endRad)
  return `M ${CX} ${CY} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
}

function quadrantLabelPos(q: Quadrant): { x: number; y: number } {
  const midAngle = QUADRANT_START[q] + 45
  const r = RMAX + 30
  const rad = ((midAngle - 90) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

const ringLabels = ['Adopt', 'Trial', 'Assess', 'Hold']
const quadrantKeys = Object.keys(QUADRANT_LABELS) as Quadrant[]
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="shrink-0">
      <RadarFilterChips :focused="focused" @focus="focusQuadrant" />
    </div>

    <div class="relative mx-auto mt-3 flex min-h-0 w-full flex-1 items-center justify-center">
      <svg
        ref="svgEl"
        viewBox="0 0 560 560"
        preserveAspectRatio="xMidYMid meet"
        class="h-full max-h-full w-full touch-none select-none"
        :style="{ maxWidth: hideSidebar ? '820px' : '600px', cursor: dragging ? 'grabbing' : 'grab', transition: 'max-width 0.25s ease' }"
        @wheel.prevent="onWheel"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointerleave="onPointerUp"
      >
        <g
          :style="{
            transform,
            transformBox: 'view-box',
            transformOrigin: '0px 0px',
            transition: animating ? 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          }"
        >
          <circle
            v-for="(r, i) in RING_OUTER"
            :key="'ring-' + i"
            :cx="CX"
            :cy="CY"
            :r="r"
            fill="none"
            stroke="rgba(128,128,128,0.18)"
            stroke-width="0.8"
          />

          <line :x1="CX" :y1="CY - RMAX" :x2="CX" :y2="CY + RMAX" stroke="rgba(128,128,128,0.18)" stroke-width="0.8" />
          <line :x1="CX - RMAX" :y1="CY" :x2="CX + RMAX" :y2="CY" stroke="rgba(128,128,128,0.18)" stroke-width="0.8" />

          <template v-for="key in quadrantKeys" :key="'q-' + key">
            <path
              :d="quadrantArc(key)"
              :fill="QUADRANT_COLORS[key]"
              :fill-opacity="!focused ? 0.12 : (focused === key ? 0.18 : 0.04)"
              stroke="none"
              style="transition: fill-opacity 0.3s ease"
            />
          </template>

          <AnimatePresence>
            <RadarBlipDot
              v-for="c in singles"
              :key="c.blips[0]!.id"
              :blip="c.blips[0]!"
              :x="positions.get(c.blips[0]!.id)?.x ?? CX"
              :y="positions.get(c.blips[0]!.id)?.y ?? CY"
              :prev-x="prevPositions[c.blips[0]!.id]?.x"
              :prev-y="prevPositions[c.blips[0]!.id]?.y"
              :scale="view.scale"
              :direction="blipDirection(c.blips[0]!)"
              @click="handleBlipClick(c.blips[0]!)"
              @hover="(v) => (hoveredId = v ? c.blips[0]!.id : null)"
            />
            <RadarCluster
              v-for="c in groups"
              :key="c.blips.map((b) => b.id).join(',')"
              :x="c.x"
              :y="c.y"
              :blips="c.blips"
              :scale="view.scale"
              @expand="zoomAt({ x: c.x, y: c.y }, 2.2)"
            />
          </AnimatePresence>

          <g
            v-if="hoveredBlip && hoveredPos"
            :style="{
              transform: `scale(${1 / view.scale})`,
              transformBox: 'view-box',
              transformOrigin: `${hoveredPos.x}px ${hoveredPos.y}px`,
            }"
          >
            <text
              :x="hoveredPos.x"
              :y="hoveredPos.y - 17"
              text-anchor="middle"
              font-size="11"
              font-weight="500"
              fill="#18181b"
              stroke="#fafafa"
              stroke-width="3.5"
              paint-order="stroke"
              stroke-linejoin="round"
              class="pointer-events-none select-none"
            >
              {{ hoveredBlip.name }}
            </text>
          </g>

          <template v-for="(r, i) in RING_OUTER" :key="'rl-' + i">
            <text
              :x="CX + 6"
              :y="CY - r + (i === 0 ? 15 : 10)"
              font-size="10"
              fill="#999"
              stroke="#fafafa"
              stroke-width="2.5"
              paint-order="stroke"
              stroke-linejoin="round"
              class="pointer-events-none select-none"
            >
              {{ ringLabels[i] }}
            </text>
          </template>

          <template v-for="key in quadrantKeys" :key="'ql-' + key">
            <text
              :x="quadrantLabelPos(key).x"
              :y="quadrantLabelPos(key).y"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="11"
              font-weight="500"
              :fill="!focused || focused === key ? QUADRANT_COLORS[key] : '#cbd5e1'"
              stroke="#fafafa"
              stroke-width="3.5"
              paint-order="stroke"
              stroke-linejoin="round"
              class="pointer-events-none select-none"
            >
              {{ QUADRANT_LABELS[key] }}
            </text>
          </template>
        </g>
      </svg>

      <div class="absolute bottom-3 right-3">
        <RadarZoomControls />
      </div>
    </div>
  </div>
</template>
