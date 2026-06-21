import { useStorage } from '@vueuse/core'

const hideSidebar = useStorage('techradar:hide-sidebar', false)
const useClusters = useStorage('techradar:use-clusters', true)

export function useRadarSettings() {
  return { hideSidebar, useClusters }
}
