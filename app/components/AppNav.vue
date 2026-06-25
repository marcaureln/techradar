<script setup lang="ts">
const { show } = useCommandPalette();
const { canEdit, secure, user, signIn, signOut } = useAuth();
</script>

<template>
  <nav class="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
    <NuxtLink to="/" class="font-title text-xl tracking-normal text-zinc-900 transition-opacity hover:opacity-70">
      Tech Radar
    </NuxtLink>

    <div class="flex items-center gap-2">
      <button
        class="flex h-9 items-center gap-1 rounded-md border border-zinc-200 px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-700"
        title="Search and commands"
        @click="show"
      >
        <span class="text-sm">⌘</span>K
      </button>

      <button
        v-if="canEdit"
        class="inline-flex h-9 items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        @click="navigateTo('/?add=1')"
      >
        <Icon name="ph:plus" class="h-4 w-4" />
        Add blip
      </button>

      <button
        v-else-if="secure && !user"
        class="inline-flex h-9 items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        @click="signIn"
      >
        <Icon name="ph:sign-in" class="h-4 w-4" />
        Sign in
      </button>

      <button
        v-if="secure && user"
        class="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:text-zinc-900"
        :title="`Signed in as ${user.email}${canEdit ? '' : ' (read-only)'} — sign out`"
        aria-label="Sign out"
        @click="signOut"
      >
        <Icon name="ph:sign-out" class="h-4 w-4" />
      </button>

      <AppSettingsMenu />
    </div>
  </nav>
</template>
