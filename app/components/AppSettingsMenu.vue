<script setup lang="ts">
import { ref, computed } from 'vue';
import { onClickOutside, useClipboard } from '@vueuse/core';

const { hideSidebar, useClusters, hideLegend } = useRadarSettings();
const { secure, canEdit, mcpEnabled, refresh } = useAuth();
const updateSettings = useUpdateSettings();

const mcpLocked = computed(() => !(secure.value && canEdit.value));
const mcpHint = computed(() =>
  mcpLocked.value
    ? 'MCP endpoint (/mcp). Control it with the MCP_ENABLED environment variable.'
    : 'Read tools are open; write tools need the token below.'
);
function setMcp(enabled: boolean) {
  updateSettings.mutate({ mcpEnabled: enabled }, { onSuccess: () => refresh() });
}

const showMcpToken = computed(() => secure.value && canEdit.value && mcpEnabled.value);
const { token, regenerate } = useMcpToken(showMcpToken);
const tokenShort = computed(() => (token.value ? `${token.value.slice(0, 16)}…` : ''));
const { copy, copied } = useClipboard({ legacy: true });

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

        <div v-if="showMcpToken" class="space-y-1.5 rounded-md px-2 pt-1 pb-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-zinc-500">Write token</span>
            <button
              class="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
              :disabled="regenerate.isPending.value"
              @click="regenerate.mutate()"
            >
              {{ token ? 'Regenerate' : 'Generate' }}
            </button>
          </div>
          <div v-if="token" class="flex items-center gap-1.5">
            <code class="min-w-0 flex-1 truncate rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600">
              {{ tokenShort }}
            </code>
            <button
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:text-zinc-900"
              :title="copied ? 'Copied' : 'Copy token'"
              @click="copy(token)"
            >
              <Icon :name="copied ? 'ph:check' : 'ph:copy'" class="h-3.5 w-3.5" />
            </button>
          </div>
          <p v-else class="text-xs text-zinc-400">Generate a token so AI tools can edit blips over MCP.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>
