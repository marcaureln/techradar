<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { QUADRANT_COLORS } from '#shared/lib/radar/constants';
import type { BlipWithHistory } from '#shared/types';

const props = defineProps<{
  x: number;
  y: number;
  blips: BlipWithHistory[];
  scale?: number;
}>();

const emit = defineEmits<{ expand: [] }>();

const markerStyle = useMarkerStyle(props);

const color = computed(() => {
  const q = props.blips[0]?.quadrant;
  return props.blips.every((b) => b.quadrant === q) ? QUADRANT_COLORS[q] : '#71717a';
});
</script>

<template>
  <motion.g
    :style="{ transformOrigin: `${x}px ${y}px`, cursor: 'pointer', outline: 'none' }"
    tabindex="-1"
    :initial="{ scale: 0.4, opacity: 0 }"
    :animate="{ scale: 1, opacity: 1 }"
    :transition="{ duration: 0.18 }"
    @click.stop="emit('expand')"
  >
    <g :style="markerStyle">
      <circle :cx="x" :cy="y" r="11" fill="#fff" />
      <circle :cx="x" :cy="y" r="11" :fill="color" fill-opacity="0.18" :stroke="color" stroke-width="1.5" />
      <text
        :x="x"
        :y="y"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="9"
        font-weight="600"
        :fill="color"
        style="pointer-events: none; user-select: none"
      >
        {{ blips.length }}
      </text>
    </g>
  </motion.g>
</template>
