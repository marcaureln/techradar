<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useEventListener } from '@vueuse/core';
import { QUADRANT_LABELS } from '#shared/lib/radar/constants';
import type { Quadrant } from '#shared/types';

const { open, mode, showBlips, hide, toggle } = useCommandPalette();
const { focusQuadrant, reset } = useRadarView();
const { data: blips } = useBlips();
const { canEdit } = useAuth();

const query = ref('');
const activeIndex = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);

interface Item {
  id: string;
  label: string;
  hint?: string;
  // Return true to keep the palette open (e.g. switching into blip search).
  run: () => unknown;
}

const quadrantKeys = Object.keys(QUADRANT_LABELS) as Quadrant[];

const commandItems = computed<Item[]>(() => [
  {
    id: 'search',
    label: 'Search blips…',
    hint: '/',
    run: () => {
      enterBlipMode();
      return true;
    },
  },
  ...(canEdit.value ? [{ id: 'add', label: 'Add blip', hint: 'Create', run: () => navigateTo('/?add=1') }] : []),
  { id: 'radar', label: 'Go to radar', hint: 'Navigate', run: () => navigateTo('/') },
  ...quadrantKeys.map((q) => ({
    id: `focus-${q}`,
    label: `Focus ${QUADRANT_LABELS[q]}`,
    hint: 'Radar',
    run: () => {
      focusQuadrant(q);
      navigateTo('/');
    },
  })),
  {
    id: 'reset',
    label: 'Reset radar view',
    hint: 'Radar',
    run: () => {
      reset();
      navigateTo('/');
    },
  },
]);

const blipItems = computed<Item[]>(() =>
  (blips.value ?? []).map((b) => ({
    id: `blip-${b.id}`,
    label: b.name,
    hint: `#${b.number}`,
    run: () => navigateTo(`/?blip=${b.number}`),
  }))
);

const items = computed<Item[]>(() => {
  const q = query.value.trim().toLowerCase();
  const source = mode.value === 'blip' ? blipItems.value : commandItems.value;
  if (!q) return source;
  return source.filter((i) => i.label.toLowerCase().includes(q) || i.hint?.toLowerCase().includes(q));
});

const placeholder = computed(() => (mode.value === 'blip' ? 'Search blips' : 'Search commands'));

function enterBlipMode() {
  mode.value = 'blip';
  query.value = '';
  activeIndex.value = 0;
  nextTick(() => inputEl.value?.focus());
}

watch(items, () => (activeIndex.value = 0));

watch(open, (v) => {
  if (v) {
    query.value = '';
    activeIndex.value = 0;
    nextTick(() => inputEl.value?.focus());
  }
});

function runActive() {
  const item = items.value[activeIndex.value];
  if (!item) return;
  if (item.run() === true) return;
  hide();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, items.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    runActive();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    // From blip search, step back to the command menu first.
    if (mode.value === 'blip') {
      mode.value = 'command';
      query.value = '';
    } else hide();
  }
}

// Global shortcuts: Cmd/Ctrl+K = command menu, "/" = blip search.
useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    toggle();
    return;
  }
  if (e.key === '/' && !open.value) {
    const el = e.target as HTMLElement;
    const tag = el?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return;
    e.preventDefault();
    showBlips();
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[70] flex items-start justify-center bg-black/20 p-4 pt-[12vh]"
        @click.self="hide"
      >
        <div class="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white" @keydown="onKeydown">
          <div class="flex items-center gap-2 border-b border-zinc-100 px-4">
            <span v-if="mode === 'blip'" class="text-xs font-medium text-zinc-400">Blips</span>
            <input
              ref="inputEl"
              v-model="query"
              type="text"
              :placeholder="placeholder"
              class="w-full py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
          </div>
          <ul class="max-h-80 overflow-y-auto py-1">
            <li v-if="!items.length" class="px-4 py-6 text-center text-sm text-zinc-400">No results.</li>
            <li
              v-for="(item, i) in items"
              :key="item.id"
              class="mx-1 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm"
              :class="i === activeIndex ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-700'"
              @mouseenter="activeIndex = i"
              @click="runActive"
            >
              <span>{{ item.label }}</span>
              <span class="text-xs text-zinc-400">{{ item.hint }}</span>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
