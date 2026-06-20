<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { QUADRANT_COLORS } from '#shared/lib/radar/constants'
import type { BlipWithHistory } from '#shared/types'

const props = defineProps<{
  blip: BlipWithHistory
  x: number
  y: number
  prevX?: number
  prevY?: number
  isOverdue: boolean
  scale?: number
}>()

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
      <motion.circle
        v-if="isOverdue"
        :cx="x"
        :cy="y"
        :r="13"
        fill="none"
        :stroke="QUADRANT_COLORS[blip.quadrant]"
        stroke-width="2"
        :animate="{ r: [13, 22], opacity: [0.7, 0] }"
        :transition="{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }"
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