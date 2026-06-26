<script setup lang="ts">
const { show } = useCommandPalette();
const { canEdit, secure, user, signIn, signOut, signingIn, signingOut } = useAuth();
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
        :disabled="signingIn"
        class="inline-flex h-9 items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-70"
        @click="signIn"
      >
        <Icon
          :name="signingIn ? 'ph:spinner-gap' : 'ph:sign-in'"
          class="h-4 w-4"
          :class="{ 'animate-spin': signingIn }"
        />
        Sign in
      </button>

      <button
        v-if="secure && user"
        :disabled="signingOut"
        class="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-70"
        :title="`Signed in as ${user.email}${canEdit ? '' : ' (read-only)'} — sign out`"
        aria-label="Sign out"
        @click="signOut"
      >
        <Icon
          :name="signingOut ? 'ph:spinner-gap' : 'ph:sign-out'"
          class="h-4 w-4"
          :class="{ 'animate-spin': signingOut }"
        />
      </button>

      <AppSettingsMenu />
    </div>
  </nav>
</template>
