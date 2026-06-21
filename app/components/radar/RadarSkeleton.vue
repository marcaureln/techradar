<script setup lang="ts">
// Loading placeholder shaped like the real radar so the layout doesn't shift
// when data arrives. Mirrors Radar.vue's structure (chips, svg, zoom controls).
const RINGS = [57.5, 115, 172.5, 230]
const CHIP_WIDTHS = ['w-28', 'w-20', 'w-24', 'w-40']

// A scattered set of placeholder blips inside the radar (all within r=230).
const DOTS = [
  { x: 338, y: 196 }, { x: 214, y: 168 }, { x: 372, y: 318 }, { x: 196, y: 352 },
  { x: 256, y: 244 }, { x: 318, y: 262 }, { x: 210, y: 300 }, { x: 356, y: 232 },
  { x: 244, y: 190 }, { x: 300, y: 350 }, { x: 176, y: 252 }, { x: 392, y: 296 },
]
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <div class="flex shrink-0 flex-wrap items-center justify-center gap-2">
      <Skeleton v-for="w in CHIP_WIDTHS" :key="w" :class="['h-7 rounded-full', w]" />
    </div>

    <div class="relative mx-auto mt-3 flex min-h-0 w-full flex-1 items-center justify-center">
      <svg
        viewBox="0 0 560 560"
        preserveAspectRatio="xMidYMid meet"
        class="h-full max-h-full w-full animate-pulse"
        style="max-width: 600px"
      >
        <circle
          v-for="r in RINGS"
          :key="r"
          cx="280"
          cy="280"
          :r="r"
          fill="none"
          stroke="rgba(128,128,128,0.18)"
          stroke-width="0.8"
        />
        <line x1="280" y1="50" x2="280" y2="510" stroke="rgba(128,128,128,0.18)" stroke-width="0.8" />
        <line x1="50" y1="280" x2="510" y2="280" stroke="rgba(128,128,128,0.18)" stroke-width="0.8" />
        <circle
          v-for="(d, i) in DOTS"
          :key="i"
          :cx="d.x"
          :cy="d.y"
          r="11"
          fill="#e4e4e7"
        />
      </svg>

      <div class="absolute bottom-3 right-3">
        <Skeleton class="h-11 w-32 rounded-lg" />
      </div>
    </div>
  </div>
</template>
