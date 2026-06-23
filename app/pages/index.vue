<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { motion, AnimatePresence } from 'motion-v';
import { onClickOutside } from '@vueuse/core';
import type { BlipWithHistory } from '#shared/types';

definePageMeta({
  layout: 'default',
});

const route = useRoute();
const router = useRouter();

const { data: blips, isPending } = useBlips();
const { hideSidebar } = useRadarSettings();
const { canEdit } = useAuth();

const selectedBlip = computed<BlipWithHistory | null>(() => {
  const n = Number(route.query.blip);
  if (!n) return null;
  return (blips.value ?? []).find((b) => b.number === n) ?? null;
});
const selectedId = computed(() => selectedBlip.value?.id ?? null);

function selectBlip(blip: BlipWithHistory) {
  showAddSheet.value = false; // never both panels at once
  router.replace({ query: { ...route.query, blip: blip.number } });
}
function clearSelection() {
  const query = { ...route.query };
  delete query.blip;
  router.replace({ query });
}

// Close the detail panel on any click outside it, except the radar and sidebar,
// which handle their own selection (so clicking another blip switches panels).
const detailPanel = ref(null);
const radarArea = ref<HTMLElement | null>(null);
const sidebarArea = ref<HTMLElement | null>(null);
onClickOutside(detailPanel, () => selectedBlip.value && clearSelection(), { ignore: [radarArea, sidebarArea] });

const showAddSheet = ref(false);
const editingBlip = ref<BlipWithHistory | null>(null);

function openAdd() {
  if (!canEdit.value) return;
  if (selectedBlip.value) clearSelection(); // close the detail panel first
  editingBlip.value = null;
  showAddSheet.value = true;
}
function openEdit(blip: BlipWithHistory) {
  if (!canEdit.value) return;
  clearSelection();
  editingBlip.value = blip;
  showAddSheet.value = true;
}
function closeSheet() {
  showAddSheet.value = false;
  editingBlip.value = null;
}

watch(
  () => route.query.add,
  (v) => {
    if (v) {
      openAdd();
      const query = { ...route.query };
      delete query.add;
      router.replace({ query });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="relative z-40 mx-auto flex h-full max-w-7xl flex-col px-4 pt-10 pb-4">
    <div class="flex min-h-0 flex-1 gap-6">
      <div
        ref="sidebarArea"
        class="hidden h-full shrink-0 overflow-hidden md:block"
        :style="{ width: hideSidebar ? '0px' : '14rem', transition: 'width 0.25s ease' }"
      >
        <RadarSidebar
          class="w-56"
          :blips="blips ?? []"
          :selected-id="selectedId"
          :loading="isPending"
          @select="selectBlip"
        />
      </div>
      <div ref="radarArea" class="flex min-w-0 flex-1 items-center justify-center">
        <RadarSkeleton v-if="isPending" />
        <Radar v-else class="h-full w-full" :blips="blips ?? []" @select="selectBlip" @deselect="clearSelection" />
      </div>
      <div
        class="hidden h-full shrink-0 md:block"
        :style="{ width: hideSidebar ? '0px' : '14rem', transition: 'width 0.25s ease' }"
        aria-hidden="true"
      />
    </div>
  </div>

  <ClientOnly>
    <AnimatePresence>
      <LazyRadarDetailPanel
        v-if="selectedBlip"
        ref="detailPanel"
        :blip="selectedBlip"
        @close="clearSelection"
        @edit="openEdit"
      />
    </AnimatePresence>
  </ClientOnly>

  <ClientOnly>
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="showAddSheet" class="fixed inset-0 z-40 bg-black/30" @click="closeSheet" />
    </Transition>
    <AnimatePresence>
      <motion.aside
        v-if="showAddSheet"
        :initial="{ x: '100%' }"
        :animate="{ x: 0 }"
        :exit="{ x: '100%' }"
        :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
        class="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white"
      >
        <LazyRadarAddEditSheet :blip="editingBlip" @close="closeSheet" />
      </motion.aside>
    </AnimatePresence>
  </ClientOnly>
</template>
