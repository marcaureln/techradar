<script setup lang="ts">
import { ref, computed } from 'vue';
import { onClickOutside } from '@vueuse/core';

const { hideSidebar, useClusters, hideLegend } = useRadarSettings();
const { secure, canEdit, mcpEnabled, refresh } = useAuth();
const updateSettings = useUpdateSettings();

const mcpLocked = computed(() => !(secure.value && canEdit.value));
const mcpHint = computed(() =>
  mcpLocked.value
    ? 'Read-only MCP endpoint (/mcp). Control it with the MCP_ENABLED environment variable.'
    : 'Read-only MCP endpoint (/mcp) for AI tools.'
);
function setMcp(enabled: boolean) {
  updateSettings.mutate({ mcpEnabled: enabled }, { onSuccess: () => refresh() });
}

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
        <div class="my-1 border-t border-zinc-100" />
        <div class="flex items-center justify-between rounded-md px-2 py-2">
          <span class="flex items-center gap-1" :class="mcpLocked ? 'text-zinc-400' : 'text-zinc-700'">
            MCP server
            <Icon name="ph:info" class="h-3.5 w-3.5 cursor-help text-zinc-400" :title="mcpHint" />
          </span>
          <ToggleSwitch :model-value="mcpEnabled" :disabled="mcpLocked" @update:model-value="setMcp($event)" />
        </div>
      </div>
    </Transition>
  </div>
</template>
