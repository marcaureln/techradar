<script setup lang="ts">
import { computed } from 'vue';
import { QUADRANT_COLORS, RING_LABELS, RING_DESCRIPTIONS } from '#shared/lib/radar/constants';
import { isDue } from '#shared/lib/radar/review';
import type { BlipWithHistory, Ring } from '#shared/types';

const props = defineProps<{
  blips: BlipWithHistory[];
  selectedId: string | null;
  loading?: boolean;
}>();

const emit = defineEmits<{ select: [blip: BlipWithHistory] }>();

const { hoveredId } = useRadarView();

const RING_ORDER: Ring[] = ['adopt', 'trial', 'assess', 'hold'];

const groups = computed(() =>
  RING_ORDER.map((ring) => ({
    ring,
    label: RING_LABELS[ring],
    blips: props.blips.filter((b) => b.ring === ring).sort((a, b) => a.number - b.number),
  })).filter((g) => g.blips.length > 0)
);
</script>

<template>
  <aside class="h-full w-56 shrink-0 overflow-y-auto pr-1">
    <div v-if="loading" class="space-y-4">
      <div v-for="g in 3" :key="g" class="space-y-2">
        <Skeleton class="h-3 w-16" />
        <Skeleton v-for="r in 3" :key="r" class="h-8 w-full" />
      </div>
    </div>

    <div v-else-if="!blips.length" class="px-2 py-6 text-sm text-zinc-400">No blips yet.</div>

    <div v-else class="space-y-4">
      <div v-for="group in groups" :key="group.ring">
        <div class="group/ring relative mb-1 flex items-center gap-2 px-2">
          <span class="text-xs font-medium tracking-wide text-zinc-600 uppercase">{{ group.label }}</span>
          <span class="text-xs text-zinc-500">{{ group.blips.length }}</span>
          <div
            class="pointer-events-none absolute top-full left-2 z-50 mt-1 w-52 rounded-lg border border-zinc-200 bg-white p-3 text-xs leading-relaxed text-zinc-600 opacity-0 transition-opacity duration-150 group-hover/ring:opacity-100"
          >
            {{ RING_DESCRIPTIONS[group.ring] }}
          </div>
        </div>
        <ul>
          <li v-for="blip in group.blips" :key="blip.id">
            <button
              class="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors"
              :class="[
                selectedId === blip.id ? 'bg-amber-50 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-100',
                hoveredId === blip.id && selectedId !== blip.id ? 'bg-zinc-100' : '',
              ]"
              @click="emit('select', blip)"
              @mouseenter="hoveredId = blip.id"
              @mouseleave="hoveredId = null"
            >
              <span
                class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white"
                :style="{ backgroundColor: QUADRANT_COLORS[blip.quadrant] }"
              >
                {{ blip.number }}
              </span>
              <span class="min-w-0 flex-1 truncate">{{ blip.name }}</span>
              <Icon
                v-if="isDue(blip)"
                name="ph:warning"
                class="h-3.5 w-3.5 shrink-0 text-red-500"
                title="Needs review"
              />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>
