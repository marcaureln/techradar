<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { QUADRANT_COLORS, CX, CY } from '#shared/lib/radar/constants';
import type { BlipWithHistory } from '#shared/types';

const props = defineProps<{
  blip: BlipWithHistory;
  x: number;
  y: number;
  scale?: number;
  direction?: 'up' | 'down' | null;
  fresh?: boolean;
}>();

const DIR_R = 13;
const dirPath = computed(() =>
  props.direction ? `M ${props.x - DIR_R} ${props.y} A ${DIR_R} ${DIR_R} 0 0 0 ${props.x + DIR_R} ${props.y} Z` : null
);
const dirTransform = computed(() => {
  const a = (Math.atan2(props.y - CY, props.x - CX) * 180) / Math.PI;
  const deg = props.direction === 'up' ? a + 90 : a + 270;
  return `rotate(${deg} ${props.x} ${props.y})`;
});

const emit = defineEmits<{ click: []; hover: [boolean] }>();

const markerStyle = useMarkerStyle(props);
</script>

<template>
  <motion.g
    :style="{
      transformOrigin: `${x}px ${y}px`,
      cursor: 'pointer',
      outline: 'none',
      WebkitTapHighlightColor: 'transparent',
    }"
    tabindex="-1"
    :initial="{ scale: 0, opacity: 0 }"
    :animate="{ scale: 1, opacity: 1 }"
    :transition="{ type: 'spring', stiffness: 200, damping: 20 }"
    :while-hover="{ scale: 1.15, transition: { duration: 0.1 } }"
    @click.stop="emit('click')"
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
        v-else-if="fresh"
        :cx="x"
        :cy="y"
        :r="DIR_R"
        fill="none"
        :stroke="QUADRANT_COLORS[blip.quadrant]"
        stroke-width="1.5"
        stroke-opacity="0.6"
      />
      <circle :cx="x" :cy="y" :r="9" :fill="QUADRANT_COLORS[blip.quadrant]" />
      <text
        :x="x"
        :y="y"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="8"
        font-weight="500"
        fill="white"
        style="pointer-events: none; user-select: none"
      >
        {{ blip.number }}
      </text>
    </g>
  </motion.g>
</template>
