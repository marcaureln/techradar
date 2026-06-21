import { useStorage } from '@vueuse/core'

// Client-side radar preferences, persisted across reloads.
const hideSidebar = useStorage('techradar:hide-sidebar', false)
const useClusters = useStorage('techradar:use-clusters', true)

export function useRadarSettings() {
  return { hideSidebar, useClusters }
}
