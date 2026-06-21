<script setup lang="ts">
import { useRoute } from 'nuxt/app'

const route = useRoute()
const { show } = useCommandPalette()

const linkClass = (active: boolean) =>
  active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
</script>

<template>
  <nav class="relative flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
    <NuxtLink
      to="/"
      class="font-title text-xl tracking-normal text-zinc-900 transition-opacity hover:opacity-70"
    >
      Tech Radar
    </NuxtLink>

    <button
      class="absolute left-1/2 top-1/2 hidden h-9 w-72 -translate-x-1/2 -translate-y-1/2 items-center justify-between rounded-md border border-zinc-200 px-3 text-sm text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-600 sm:flex"
      title="Search and commands"
      @click="show"
    >
      Search…
      <span class="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">⌘K</span>
    </button>

    <div class="flex items-center gap-1">
      <NuxtLink
        to="/review"
        class="flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors"
        :class="linkClass(route.path === '/review')"
      >
        Review
      </NuxtLink>
      <button
        class="ml-2 inline-flex h-9 items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        @click="navigateTo('/?add=1')"
      >
        <Icon name="ph:plus" class="h-4 w-4" />
        Add blip
      </button>
    </div>
  </nav>
</template>
