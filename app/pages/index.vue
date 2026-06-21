<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
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
  showAddSheet.value = false // never both panels at once
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
  if (selectedBlip.value) clearSelection() // close the detail panel first
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
  <div class="relative z-40 mx-auto flex h-full max-w-7xl flex-col px-4 pb-4 pt-10">
    <div class="flex min-h-0 flex-1 gap-6">
      <RadarSidebar
        class="hidden md:block"
        :blips="blips ?? []"
        :selected-id="selectedId"
        :loading="isPending"
        @select="selectBlip"
      />
      <div class="flex min-w-0 flex-1 items-center justify-center">
        <RadarSkeleton v-if="isPending" />
        <Radar v-else class="h-full w-full" :blips="blips ?? []" @select="selectBlip" />
      </div>
      <!-- Mirrors the sidebar so the radar stays centred while the sidebar sits left. -->
      <div class="hidden w-56 shrink-0 md:block" aria-hidden="true" />
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
        class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white"
      >
        <RadarAddEditSheet :blip="editingBlip" @close="closeSheet" />
      </motion.aside>
    </AnimatePresence>
  </ClientOnly>
</template>
