<script setup lang="ts">
import { ref } from 'vue';
import type { CreateBlipInput } from '#shared/types';

definePageMeta({
  layout: 'setup',
  middleware: async () => {
    const me = await $fetch<{ data: { canEdit: boolean } }>('/api/me');
    if (!me?.data?.canEdit) return navigateTo('/');
  },
});

const name = ref('');
const blips = ref<CreateBlipInput[]>([]);
const enableMcp = ref(true);
const loading = ref(false);
const error = ref('');

const updateSettings = useUpdateSettings();
const createBlip = useCreateBlip();
const router = useRouter();

async function open() {
  if (!name.value.trim()) {
    error.value = 'Please enter a name.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    for (const blip of blips.value) {
      await createBlip.mutateAsync(blip);
    }
    await updateSettings.mutateAsync({
      setupDone: true,
      name: name.value.trim(),
      mcpEnabled: enableMcp.value,
    });
    await router.push('/');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1 text-center">
      <h1 class="text-2xl font-medium text-zinc-900">Welcome</h1>
      <p class="text-sm text-zinc-500">Name your radar to get started.</p>
    </div>

    <form class="space-y-4" @submit.prevent="open">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-zinc-700">Name or company</label>
        <input
          v-model="name"
          type="text"
          autocomplete="organization"
          placeholder="Acme Inc."
          class="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none"
        />
      </div>

      <SetupBlipBulkAdd v-model="blips" />

      <div class="flex items-center justify-between rounded-md border border-zinc-200 p-3">
        <span class="text-sm font-medium text-zinc-800">Enable MCP server</span>
        <ToggleSwitch v-model="enableMcp" />
      </div>

      <div v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="loading || blips.length === 0"
        class="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {{ loading ? 'Setting up…' : 'Open radar' }}
      </button>
    </form>
  </div>
</template>
