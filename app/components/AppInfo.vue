<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

const open = ref(false);
const root = ref<HTMLElement | null>(null);
onClickOutside(root, () => (open.value = false));

const version = useRuntimeConfig().public.version;
</script>

<template>
  <div ref="root" class="fixed bottom-4 left-4 z-40">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div v-if="open" class="absolute bottom-11 left-0 w-60 rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <div class="flex items-baseline justify-between">
          <span class="font-medium text-zinc-900">Tech Radar</span>
          <span class="text-xs text-zinc-400">v{{ version }}</span>
        </div>
        <p class="mt-2 text-zinc-500">
          Built by
          <a
            href="https://marcaureln.com"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 transition-colors hover:decoration-zinc-900"
            >Alex N'Guessan</a
          >.
        </p>
      </div>
    </Transition>

    <button
      class="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 transition-colors hover:text-zinc-700"
      :aria-expanded="open"
      aria-label="About this app"
      @click="open = !open"
    >
      <Icon name="ph:info" class="h-4 w-4" />
    </button>
  </div>
</template>
