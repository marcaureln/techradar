<script setup lang="ts">
const items = [
  { key: 'new', label: 'New' },
  { key: 'moved', label: 'Moved in/out' },
  { key: 'none', label: 'No change' },
] as const;
</script>

<template>
  <div class="space-y-1 text-xs text-zinc-500">
    <div v-for="it in items" :key="it.key" class="flex items-center gap-2">
      <svg width="18" height="18" viewBox="0 0 18 18" class="shrink-0">
        <circle
          v-if="it.key === 'new'"
          cx="9"
          cy="9"
          r="7.5"
          fill="none"
          stroke="#71717a"
          stroke-width="1.2"
          stroke-opacity="0.6"
        />
        <path v-else-if="it.key === 'moved'" d="M 2 9 A 7 7 0 0 1 16 9 Z" fill="#71717a" fill-opacity="0.45" />
        <circle cx="9" cy="9" r="5" fill="#71717a" />
      </svg>
      <span>{{ it.label }}</span>
    </div>
  </div>
</template>
