<script setup lang="ts">
import { QUADRANT_COLORS, QUADRANT_TEXT_COLORS, QUADRANT_LABELS } from '#shared/lib/radar/constants';
import type { Quadrant } from '#shared/types';

const props = defineProps<{
  focused: Quadrant | null;
}>();

const emit = defineEmits<{
  focus: [quadrant: Quadrant | null];
}>();

const quadrantKeys = Object.keys(QUADRANT_LABELS) as Quadrant[];

function chipStyle(key: Quadrant) {
  const color = QUADRANT_COLORS[key];
  if (props.focused === key) {
    return { borderColor: color, backgroundColor: color, color: '#fff' };
  }
  if (props.focused) {
    return { borderColor: '#e4e4e7', backgroundColor: 'transparent', color: '#71717a' };
  }
  return { borderColor: `${color}40`, backgroundColor: `${color}10`, color: QUADRANT_TEXT_COLORS[key] };
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="relative flex flex-wrap items-center justify-center gap-2">
      <button
        v-for="key in quadrantKeys"
        :key="key"
        class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
        :style="chipStyle(key)"
        @click="emit('focus', focused === key ? null : key)"
      >
        <span
          class="inline-block h-2 w-2 rounded-full"
          :style="{ backgroundColor: focused === key ? '#fff' : QUADRANT_COLORS[key] }"
        />
        {{ QUADRANT_LABELS[key] }}
      </button>

      <button
        v-if="focused"
        class="absolute top-1/2 left-full ml-3 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap text-zinc-500 transition-colors hover:text-zinc-900"
        @click="emit('focus', null)"
      >
        View all
      </button>
    </div>
  </div>
</template>
