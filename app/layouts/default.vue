<template>
  <div class="relative h-dvh overflow-hidden bg-zinc-50">
    <main class="h-full overflow-hidden">
      <slot />
    </main>
    <AppNav class="pointer-events-none absolute inset-x-0 top-0 z-50" />
    <AppCommandPalette />
    <Toaster />
    <AppInfo />
  </div>
</template>
