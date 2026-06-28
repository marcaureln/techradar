<script setup lang="ts">
import { ref, computed } from 'vue';
import { motion } from 'motion-v';
import { useClipboard } from '@vueuse/core';
import { QUADRANT_COLORS, QUADRANT_LABELS, RING_LABELS } from '#shared/lib/radar/constants';
import { isDue, daysUntilDue } from '#shared/lib/radar/review';
import type { BlipWithHistory } from '#shared/types';

const props = defineProps<{
  blip: BlipWithHistory;
}>();

const emit = defineEmits<{
  close: [];
  edit: [blip: BlipWithHistory];
}>();

const markReviewed = useMarkReviewed();
const archiveBlip = useArchiveBlip();
const restoreBlip = useRestoreBlip();
const { show } = useToast();
const { copy } = useClipboard({ legacy: true });
const { canEdit } = useAuth();

const showNotes = ref(false);
const copied = ref(false);
const overdue = computed(() => isDue(props.blip));
const daysLeft = computed(() => daysUntilDue(props.blip));

function handleReview() {
  markReviewed.mutate(props.blip.id);
}

function handleArchive() {
  const id = props.blip.id;
  archiveBlip.mutate(id);
  emit('close');
  show('Blip archived.', { actionLabel: 'Undo', action: () => restoreBlip.mutate(id) });
}

function copyLink() {
  copy(`${location.origin}/?blip=${props.blip.number}`);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <motion.aside
    :initial="{ x: '100%' }"
    :animate="{ x: 0 }"
    :exit="{ x: '100%' }"
    :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
    class="fixed top-0 right-0 z-[60] h-full w-96 overflow-y-auto border-l border-zinc-200 bg-white"
    @click.stop
  >
    <div class="p-6">
      <div class="mb-4 flex items-start justify-between">
        <div class="flex items-center gap-2">
          <span
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white"
            :style="{ backgroundColor: QUADRANT_COLORS[blip.quadrant] }"
          >
            {{ blip.number }}
          </span>
          <h2 class="text-lg font-medium text-zinc-900">{{ blip.name }}</h2>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            :title="copied ? 'Copied' : 'Copy link'"
            aria-label="Copy link"
            @click="copyLink"
          >
            <Icon v-if="!copied" name="ph:link" class="h-4 w-4" />
            <Icon v-else name="ph:check" class="h-4 w-4 text-amber-600" />
          </button>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            title="Close"
            aria-label="Close"
            @click="emit('close')"
          >
            <Icon name="ph:x" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="mb-4 flex gap-2">
        <span
          class="rounded-md px-2 py-0.5 text-xs font-medium"
          :style="{
            backgroundColor: `${QUADRANT_COLORS[blip.quadrant]}15`,
            color: QUADRANT_COLORS[blip.quadrant],
          }"
        >
          {{ QUADRANT_LABELS[blip.quadrant] }}
        </span>
        <span class="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
          {{ RING_LABELS[blip.ring] }}
        </span>
      </div>

      <p class="mb-4 text-sm leading-relaxed text-zinc-600">{{ blip.description }}</p>

      <div v-if="blip.notes" class="mb-4">
        <button class="text-xs font-medium text-zinc-500 hover:text-zinc-700" @click="showNotes = !showNotes">
          {{ showNotes ? 'Hide notes' : 'Show notes' }}
        </button>
        <div v-if="showNotes" class="mt-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-600">
          {{ blip.notes }}
        </div>
      </div>

      <div v-if="blip.history.length > 0" class="mb-4">
        <h3 class="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">Ring history</h3>
        <div class="space-y-1">
          <div v-for="h in blip.history" :key="h.id" class="flex items-center gap-2 text-xs text-zinc-500">
            <span class="font-medium">{{ RING_LABELS[h.fromRing] }}</span>
            <span>&rarr;</span>
            <span class="font-medium">{{ RING_LABELS[h.toRing] }}</span>
            <span class="text-zinc-400">{{ new Date(h.changedAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <div class="mb-4 flex items-center gap-2 text-xs text-zinc-400">
        <span>Last evaluated: {{ new Date(blip.lastEvaluatedAt).toLocaleDateString() }}</span>
        <span v-if="overdue" class="rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-600">
          {{ daysLeft === 0 ? 'Overdue' : `${-daysLeft}d overdue` }}
        </span>
      </div>

      <div v-if="canEdit" class="flex gap-2">
        <button
          class="flex h-9 items-center rounded-md border border-zinc-200 px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          @click="emit('edit', blip)"
        >
          Edit
        </button>
        <button
          class="flex h-9 items-center rounded-md border border-zinc-200 px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          @click="handleReview"
        >
          Mark reviewed
        </button>
        <button
          class="flex h-9 items-center rounded-md border border-zinc-200 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          @click="handleArchive"
        >
          Archive
        </button>
      </div>
    </div>
  </motion.aside>
</template>
