<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

const { hideSidebar, useClusters, hideLegend } = useRadarSettings();
const open = ref(false);
const root = ref<HTMLElement | null>(null);
onClickOutside(root, () => (open.value = false));
</script>

<template>
  <div ref="root" class="relative">
    <button
      class="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:text-zinc-900"
      :aria-expanded="open"
      aria-label="Settings"
      @click="open = !open"
    >
      <Icon name="ph:gear-six" class="h-4 w-4" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="-translate-y-1 opacity-0"
    >
      <div
        v-if="open"
        class="absolute top-11 right-0 z-50 w-56 rounded-lg border border-zinc-200 bg-white p-1.5 text-sm"
      >
        <div class="flex items-center justify-between rounded-md px-2 py-2">
          <span class="text-zinc-700">Show sidebar</span>
          <ToggleSwitch :model-value="!hideSidebar" @update:model-value="hideSidebar = !$event" />
        </div>
        <div class="flex items-center justify-between rounded-md px-2 py-2">
          <span class="text-zinc-700">Show legend</span>
          <ToggleSwitch :model-value="!hideLegend" @update:model-value="hideLegend = !$event" />
        </div>
        <div class="flex items-center justify-between rounded-md px-2 py-2">
          <span class="text-zinc-700">Cluster blips</span>
          <ToggleSwitch v-model="useClusters" />
        </div>
      </div>
    </Transition>
  </div>
</template>
