<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
    <div class="pointer-events-none absolute inset-0 opacity-[0.04]">
      <svg viewBox="0 0 560 560" class="mx-auto h-full max-h-[600px] w-auto">
        <circle cx="280" cy="280" r="230" fill="none" stroke="currentColor" stroke-width="0.8" />
        <circle cx="280" cy="280" r="172.5" fill="none" stroke="currentColor" stroke-width="0.8" />
        <circle cx="280" cy="280" r="115" fill="none" stroke="currentColor" stroke-width="0.8" />
        <circle cx="280" cy="280" r="57.5" fill="none" stroke="currentColor" stroke-width="0.8" />
        <line x1="280" y1="50" x2="280" y2="510" stroke="currentColor" stroke-width="0.8" />
        <line x1="50" y1="280" x2="510" y2="280" stroke="currentColor" stroke-width="0.8" />
      </svg>
    </div>
    <div class="relative z-10 w-full max-w-md px-6">
      <slot />
    </div>
  </div>
</template>
