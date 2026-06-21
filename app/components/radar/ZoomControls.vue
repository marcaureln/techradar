<script setup lang="ts">
const { view, zoomByButton, reset } = useRadarView()
</script>

<template>
  <div class="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white/90 p-1 backdrop-blur">
    <button
      class="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100"
      title="Zoom out"
      aria-label="Zoom out"
      @click="zoomByButton(1 / 1.3)"
    >
      <Icon name="ph:minus" class="h-4 w-4" />
    </button>
    <button
      class="flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-xs font-medium tabular-nums text-zinc-500 transition-colors hover:bg-zinc-100"
      title="Reset view"
      aria-label="Reset view"
      @click="reset"
    >
      {{ Math.round(view.scale * 100) }}%
    </button>
    <button
      class="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100"
      title="Zoom in"
      aria-label="Zoom in"
      @click="zoomByButton(1.3)"
    >
      <Icon name="ph:plus" class="h-4 w-4" />
    </button>
  </div>
</template>
