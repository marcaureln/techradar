<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { QUADRANT_KEYS, RING_KEYS } from '#shared/types';
import { QUADRANT_LABELS, QUADRANT_COLORS, RING_LABELS } from '#shared/lib/radar/constants';
import { SAMPLE_BLIPS } from '#shared/lib/sampleBlips';
import type { CreateBlipInput, Quadrant, Ring } from '#shared/types';

const blips = defineModel<CreateBlipInput[]>({ default: () => [] });

const name = ref('');
const quadrant = ref<string>('techniques');
const ring = ref<string>('trial');
const notice = ref('');
const nameInput = ref<HTMLInputElement | null>(null);

const short = (q: Quadrant) => QUADRANT_LABELS[q].split(' ')[0]!;
const quadrantOptions = QUADRANT_KEYS.map((q) => ({ value: q, label: short(q), color: QUADRANT_COLORS[q] }));
const ringOptions = RING_KEYS.map((r) => ({ value: r, label: RING_LABELS[r] }));

function focusName() {
  nextTick(() => nameInput.value?.focus());
}
onMounted(focusName);
watch(name, () => (notice.value = ''));

// A blip is a duplicate if its name (case-insensitive) and quadrant already exist;
// the same name in a different quadrant is allowed.
function isDuplicate(n: string, q: string) {
  const lower = n.toLowerCase();
  return blips.value.some((b) => b.name.toLowerCase() === lower && b.quadrant === q);
}

function add() {
  const n = name.value.trim();
  notice.value = '';
  if (!n) return;
  if (isDuplicate(n, quadrant.value)) {
    notice.value = `“${n}” is already in ${short(quadrant.value as Quadrant)}.`;
    return;
  }
  blips.value = [...blips.value, { name: n, quadrant: quadrant.value as Quadrant, ring: ring.value as Ring }];
  name.value = '';
  focusName();
}

function remove(i: number) {
  blips.value = blips.value.filter((_, idx) => idx !== i);
}

function loadExamples() {
  const examples: CreateBlipInput[] = SAMPLE_BLIPS.map(({ reviewDaysAgo, ...b }) =>
    reviewDaysAgo
      ? { ...b, lastEvaluatedAt: new Date(Date.now() - reviewDaysAgo * 86_400_000).toISOString() }
      : { ...b }
  ).filter((e) => !isDuplicate(e.name, e.quadrant));
  blips.value = [...blips.value, ...examples];
}
</script>

<template>
  <div class="space-y-2.5 text-left" @keydown.meta.enter.prevent="add" @keydown.ctrl.enter.prevent="add">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-zinc-700">Blips</span>
      <button
        type="button"
        class="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
        @click="loadExamples"
      >
        Load examples
      </button>
    </div>

    <ul v-if="blips.length" class="max-h-48 space-y-1 overflow-y-auto">
      <li
        v-for="(b, i) in blips"
        :key="i"
        class="flex items-center gap-2 rounded-md border border-zinc-200 px-2.5 py-1.5 text-sm"
      >
        <span class="min-w-0 flex-1 truncate text-zinc-800">{{ b.name }}</span>
        <span class="shrink-0 text-xs text-zinc-400">{{ short(b.quadrant) }} · {{ RING_LABELS[b.ring] }}</span>
        <button
          type="button"
          class="shrink-0 text-zinc-400 transition-colors hover:text-red-600"
          aria-label="Remove"
          @click="remove(i)"
        >
          <Icon name="ph:x" class="h-3.5 w-3.5" />
        </button>
      </li>
    </ul>

    <div class="space-y-2 rounded-md border border-zinc-200 p-2.5">
      <input
        ref="nameInput"
        v-model="name"
        type="text"
        placeholder="Blip name"
        class="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none"
        @keydown.enter.stop.prevent="add"
      />
      <RadarSegmentedControl v-model="quadrant" :options="quadrantOptions" />
      <RadarSegmentedControl v-model="ring" :options="ringOptions" />
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        @click="add"
      >
        Add blip
        <span class="flex items-center gap-0.5 text-xs text-zinc-400">
          ⌘
          <Icon name="ph:arrow-elbow-down-left" class="h-3.5 w-3.5" />
        </span>
      </button>
    </div>

    <p v-if="notice" class="text-xs text-amber-600">{{ notice }}</p>
  </div>
</template>
