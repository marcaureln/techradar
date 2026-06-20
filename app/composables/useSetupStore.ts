import { reactive, ref } from 'vue'
import { useStorage } from '@vueuse/core'

// Persisted across reloads so onboarding is resumable. The logo File can't be
// serialized, so it stays an in-memory ref (re-pick if the page is reloaded).
const step = useStorage('techradar:setup-step', 0)
const companyName = useStorage('techradar:setup-company', '')
const addSamples = useStorage('techradar:setup-samples', true)
const logoFile = ref<File | null>(null)
const logoPreview = ref<string | null>(null)

function setLogo(file: File | null) {
  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value)
  }
  logoFile.value = file
  logoPreview.value = file ? URL.createObjectURL(file) : null
}

function reset() {
  step.value = 0
  companyName.value = ''
  addSamples.value = true
  logoFile.value = null
  logoPreview.value = null
}

export function useSetupStore() {
  return reactive({
    step,
    companyName,
    logoFile,
    logoPreview,
    addSamples,
    setLogo,
    reset,
  })
}
