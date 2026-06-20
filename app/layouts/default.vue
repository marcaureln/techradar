<template>
  <div class="min-h-screen bg-zinc-50">
    <AppNav />
    <main>
      <slot />
    </main>
    <AppCommandPalette />
    <Toaster />
  </div>
</template>
