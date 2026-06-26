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
      <div v-if="open" class="absolute bottom-11 left-0 w-56 rounded-lg border border-zinc-200 bg-white p-3 text-sm">
        <div class="flex items-center justify-between">
          <a
            href="https://github.com/marcaureln/techradar"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 font-medium text-zinc-900 transition-colors hover:text-zinc-600"
          >
            <Icon name="ph:github-logo" class="h-4 w-4" />
            Tech Radar
          </a>
          <span class="text-xs text-zinc-400">v{{ version }}</span>
        </div>
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
