<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'nuxt/app'

const { data: settings, isPending } = useSettings()
const route = useRoute()
const { show } = useCommandPalette()

const logoUrl = computed(() => settings.value?.logoPath || null)
</script>

<template>
  <nav class="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
    <div class="flex items-center gap-3">
      <Skeleton v-if="isPending" class="h-8 w-8 rounded-md" />
      <img
        v-else-if="logoUrl"
        :src="logoUrl"
        alt="Logo"
        class="h-8 w-8 rounded-md object-contain"
      />
      <span class="font-title text-xl tracking-normal text-zinc-900">Tech Radar</span>
    </div>
    <div class="flex items-center gap-1">
      <NuxtLink
        to="/"
        class="flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors"
        :class="route.path === '/' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'"
      >
        Radar
      </NuxtLink>
      <NuxtLink
        to="/review"
        class="flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors"
        :class="route.path === '/review' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'"
      >
        Review
      </NuxtLink>
      <button
        class="ml-1 flex h-9 items-center gap-1 rounded-md border border-zinc-200 px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-700"
        title="Search and commands"
        @click="show"
      >
        <span class="text-sm">⌘</span>K
      </button>
    </div>
  </nav>
</template>
