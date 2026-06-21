<template>
  <div class="flex h-dvh flex-col overflow-hidden bg-zinc-50">
    <AppNav class="shrink-0" />
    <main class="min-h-0 flex-1 overflow-y-auto">
      <slot />
    </main>
    <AppCommandPalette />
    <Toaster />
    <AppInfo />
  </div>
</template>
