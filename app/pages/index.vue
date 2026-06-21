<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AnimatePresence } from 'motion-v'
import type { BlipWithHistory } from '#shared/types'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()

const { data: blips, isPending } = useBlips()

// Selection lives in the URL (?blip=<number>) — shareable, resumable, no UID.
const selectedBlip = computed<BlipWithHistory | null>(() => {
  const n = Number(route.query.blip)
  if (!n) return null
  return (blips.value ?? []).find((b) => b.number === n) ?? null
})
const selectedId = computed(() => selectedBlip.value?.id ?? null)

function selectBlip(blip: BlipWithHistory) {
  router.replace({ query: { ...route.query, blip: blip.number } })
}
function clearSelection() {
  const query = { ...route.query }
  delete query.blip
  router.replace({ query })
}

const showAddSheet = ref(false)
const editingBlip = ref<BlipWithHistory | null>(null)

function openAdd() {
  editingBlip.value = null
  showAddSheet.value = true
}
function openEdit(blip: BlipWithHistory) {
  clearSelection()
  editingBlip.value = blip
  showAddSheet.value = true
}
function closeSheet() {
  showAddSheet.value = false
  editingBlip.value = null
}

// The command palette opens the add sheet via ?add=1.
watch(
  () => route.query.add,
  (v) => {
    if (v) {
      openAdd()
      const query = { ...route.query }
      delete query.add
      router.replace({ query })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="relative z-40 mx-auto flex h-full max-w-6xl flex-col px-4 py-4">
    <div class="mb-3 flex shrink-0 items-center justify-end">
      <button
        class="inline-flex h-9 items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        @click="openAdd"
      >
        <Icon name="ph:plus" class="h-4 w-4" />
        Add blip
      </button>
    </div>

    <div class="flex min-h-0 flex-1 gap-6">
      <RadarSidebar
        class="hidden md:block"
        :blips="blips ?? []"
        :selected-id="selectedId"
        :loading="isPending"
        @select="selectBlip"
      />
      <div class="flex min-w-0 flex-1 items-center justify-center">
        <Skeleton v-if="isPending" class="aspect-square w-full max-w-[560px] rounded-full" />
        <Radar v-else class="h-full w-full" :blips="blips ?? []" @select="selectBlip" />
      </div>
    </div>
  </div>

  <!-- Click-outside backdrop dismisses the panel; main content sits above it (z-40).
       Client-only: the panel is animated (motion-v) and never present on SSR. -->
  <ClientOnly>
    <div v-if="selectedBlip" class="fixed inset-0 z-30" @click="clearSelection" />
    <AnimatePresence>
      <RadarDetailPanel
        v-if="selectedBlip"
        :blip="selectedBlip"
        @close="clearSelection"
        @edit="openEdit"
      />
    </AnimatePresence>
  </ClientOnly>

  <Teleport to="body">
    <div v-if="showAddSheet" class="fixed inset-0 z-40 bg-black/30" @click="closeSheet" />
    <div
      v-if="showAddSheet"
      class="fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-white transition-transform"
    >
      <RadarAddEditSheet :blip="editingBlip" @close="closeSheet" />
    </div>
  </Teleport>
</template>
