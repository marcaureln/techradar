<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { QUADRANT_COLORS, CX, CY } from '#shared/lib/radar/constants'
import type { BlipWithHistory } from '#shared/types'

const props = defineProps<{
  blip: BlipWithHistory
  x: number
  y: number
  prevX?: number
  prevY?: number
  scale?: number
  direction?: 'up' | 'down' | null
}>()

// Direction is a semicircle behind the dot, rotated to follow the radial ring
// direction: it bulges toward the centre when moving up (toward adopt) and
// outward when moving down (toward hold). Coloured a lighter tint of the blip.
const DIR_R = 15.4
const dirPath = computed(() =>
  props.direction
    ? `M ${props.x - DIR_R} ${props.y} A ${DIR_R} ${DIR_R} 0 0 0 ${props.x + DIR_R} ${props.y} Z`
    : null,
)
const dirTransform = computed(() => {
  const a = (Math.atan2(props.y - CY, props.x - CX) * 180) / Math.PI
  const deg = props.direction === 'up' ? a + 270 : a + 90
  return `rotate(${deg} ${props.x} ${props.y})`
})

const emit = defineEmits<{ click: []; hover: [boolean] }>()

// Counter-scale the marker by 1/zoom so dots and text keep a constant on-screen
// size — only their positions spread out when the radar is zoomed.
const markerStyle = computed(() => ({
  transform: `scale(${1 / (props.scale || 1)})`,
  transformBox: 'view-box' as const,
  transformOrigin: `${props.x}px ${props.y}px`,
}))

const isNew = computed(() => props.prevX === undefined)
const hasMoved = computed(() =>
  !isNew.value && (props.prevX !== props.x || props.prevY !== props.y),
)

const initial = computed(() => {
  if (isNew.value) return { scale: 0, opacity: 0 }
  if (hasMoved.value) return { x: props.prevX! - props.x, y: props.prevY! - props.y }
  return false as unknown as undefined
})
</script>

<template>
  <motion.g
    :style="{ transformOrigin: `${x}px ${y}px`, cursor: 'pointer', outline: 'none', WebkitTapHighlightColor: 'transparent' }"
    tabindex="-1"
    :initial="initial"
    :animate="{ x: 0, y: 0, scale: 1, opacity: 1 }"
    :transition="isNew
      ? { type: 'spring', stiffness: 200, damping: 20 }
      : { type: 'spring', stiffness: 80, damping: 18 }"
    :while-hover="{ scale: 1.15, transition: { duration: 0.1 } }"
    @click="emit('click')"
    @mouseenter="emit('hover', true)"
    @mouseleave="emit('hover', false)"
  >
    <g :style="markerStyle">
      <path
        v-if="dirPath"
        :d="dirPath"
        :transform="dirTransform"
        :fill="QUADRANT_COLORS[blip.quadrant]"
        fill-opacity="0.55"
      />
      <circle
        :cx="x"
        :cy="y"
        :r="11"
        :fill="QUADRANT_COLORS[blip.quadrant]"
      />
      <text
        :x="x"
        :y="y"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="9"
        font-weight="500"
        fill="white"
        style="pointer-events: none; user-select: none"
      >
        {{ blip.number }}
      </text>
    </g>
  </motion.g>
</template>