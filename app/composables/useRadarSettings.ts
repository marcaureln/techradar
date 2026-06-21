import { useStorage } from '@vueuse/core';

const hideSidebar = useStorage('techradar:hide-sidebar', false);
const useClusters = useStorage('techradar:use-clusters', true);
const hideLegend = useStorage('techradar:hide-legend', false);

export function useRadarSettings() {
  return { hideSidebar, useClusters, hideLegend };
}
