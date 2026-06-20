<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { SAMPLE_BLIPS } from '#shared/lib/sampleBlips'

const store = useSetupStore()
const blipsToAdd = computed(() => (store.addSamples ? SAMPLE_BLIPS : []))
const updateSettings = useUpdateSettings()
const createBlip = useCreateBlip()
const qc = useQueryClient()
const router = useRouter()

const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''

  try {
    if (store.logoFile) {
      const formData = new FormData()
      formData.append('file', store.logoFile)
      await $fetch('/api/uploads/logo', { method: 'POST', body: formData })
      // logo.post persists logoPath to Settings; refresh the cached settings.
      await qc.invalidateQueries({ queryKey: ['settings'] })
    }

    for (const blip of blipsToAdd.value) {
      await createBlip.mutateAsync(blip)
    }

    // Mark setup complete last, so a failure above leaves the wizard recoverable.
    await updateSettings.mutateAsync({ companyName: store.companyName, setupDone: true })

    store.reset() // clear persisted onboarding state
    await router.push('/')
  } catch (e: any) {
    error.value = e.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

const blipCount = computed(() => blipsToAdd.value.length)
</script>

<template>
  <div class="space-y-6 text-center">
    <div class="space-y-2">
      <h2 class="text-xl font-medium text-zinc-900">
        {{ store.companyName }}'s Tech Radar is ready
      </h2>
      <p class="text-sm text-zinc-500">
        {{ blipCount > 0 ? `Starting with ${blipCount} sample blips` : 'Starting with a blank radar' }}
      </p>
    </div>

    <div v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
      {{ error }}
    </div>

    <button
      :disabled="loading"
      class="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      @click="submit"
    >
      {{ loading ? 'Setting up...' : 'Open radar' }}
    </button>
  </div>
</template>