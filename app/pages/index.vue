<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { motion, AnimatePresence } from 'motion-v';
import type { BlipWithHistory } from '#shared/types';

definePageMeta({
  layout: 'default',
});

const route = useRoute();
const router = useRouter();

const { data: blips, isPending } = useBlips();
const { hideSidebar } = useRadarSettings();
const { canEdit } = useAuth();
const { show: showToast } = useToast();

watch(
  () => route.query.auth_error,
  (v) => {
    if (!v) return;
    showToast('Sign-in failed. Check that your account is allowed, then try again.');
    const query = { ...route.query };
    delete query.auth_error;
    router.replace({ query });
  },
  { immediate: true }
);

const selectedBlip = computed<BlipWithHistory | null>(() => {
  const n = Number(route.query.blip);
  if (!n) return null;
  return (blips.value ?? []).find((b) => b.number === n) ?? null;
});
const selectedId = computed(() => selectedBlip.value?.id ?? null);

function selectBlip(blip: BlipWithHistory) {
  showAddSheet.value = false;
  router.replace({ query: { ...route.query, blip: blip.number } });
}
function clearSelection() {
  const query = { ...route.query };
  delete query.blip;
  router.replace({ query });
}

const detailPanel = ref<{ $el?: HTMLElement } | null>(null);

function onDocClick(e: MouseEvent) {
  if (!selectedBlip.value) return;
  const el = detailPanel.value?.$el;
  if (el && el.contains(e.target as Node)) return;
  clearSelection();
}
onMounted(() => document.addEventListener('click', onDocClick));
onUnmounted(() => document.removeEventListener('click', onDocClick));

const showAddSheet = ref(false);
const editingBlip = ref<BlipWithHistory | null>(null);

function openAdd() {
  if (!canEdit.value) return;
  if (selectedBlip.value) clearSelection();
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
  <div class="relative z-40 mx-auto flex h-full w-full max-w-[1600px] flex-col px-6 pt-16 pb-4">
    <div class="flex min-h-0 flex-1 gap-6">
      <div
        class="hidden h-full shrink-0 overflow-hidden lg:block"
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
      <div class="flex min-w-0 flex-1 items-center justify-center">
        <RadarSkeleton v-if="isPending" />
        <Radar v-else class="h-full w-full" :blips="blips ?? []" @select="selectBlip" @deselect="clearSelection" />
      </div>
      <div
        class="hidden h-full shrink-0 lg:block"
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
      <div v-if="showAddSheet" class="fixed inset-0 z-50 bg-black/30" @click="closeSheet" />
    </Transition>
    <AnimatePresence>
      <motion.aside
        v-if="showAddSheet"
        :initial="{ x: '100%' }"
        :animate="{ x: 0 }"
        :exit="{ x: '100%' }"
        :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
        class="fixed top-0 right-0 z-[60] h-full w-full max-w-md bg-white"
      >
        <LazyRadarAddEditSheet :blip="editingBlip" @close="closeSheet" />
      </motion.aside>
    </AnimatePresence>
  </ClientOnly>
</template>
