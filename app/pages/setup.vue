<script setup lang="ts">
import { ref } from 'vue';
import { SAMPLE_BLIPS } from '#shared/lib/sampleBlips';

definePageMeta({
  layout: 'setup',
});

const name = ref('');
const description = ref('');
const addSamples = ref(true);
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
    if (addSamples.value) {
      for (const { reviewDaysAgo, ...blip } of SAMPLE_BLIPS) {
        await createBlip.mutateAsync(
          reviewDaysAgo
            ? { ...blip, lastEvaluatedAt: new Date(Date.now() - reviewDaysAgo * 86_400_000).toISOString() }
            : blip
        );
      }
    }
    await updateSettings.mutateAsync({
      setupDone: true,
      name: name.value.trim(),
      description: description.value.trim() || undefined,
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
    <div class="space-y-3 text-center">
      <img src="/techradar-logo.svg" alt="" class="mx-auto h-20 w-20" />
      <div class="space-y-1">
        <h1 class="text-2xl font-medium text-zinc-900">Welcome</h1>
        <p class="text-sm text-zinc-500">Name your radar to get started.</p>
      </div>
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

      <div>
        <label class="mb-1.5 block text-sm font-medium text-zinc-700">
          Description <span class="text-zinc-400">(optional)</span>
        </label>
        <textarea
          v-model="description"
          rows="2"
          placeholder="What this radar tracks. Shown to search engines."
          class="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none"
        />
      </div>

      <label
        class="flex cursor-pointer items-start gap-2.5 rounded-md border border-zinc-200 p-3 text-left transition-colors hover:border-zinc-300"
      >
        <input v-model="addSamples" type="checkbox" class="mt-0.5 h-4 w-4 accent-zinc-900" />
        <span class="text-sm">
          <span class="block font-medium text-zinc-800">Start with sample blips</span>
          <span class="block text-zinc-500">Pre-fill the radar with example technologies. Uncheck to start blank.</span>
        </span>
      </label>

      <div v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {{ loading ? 'Setting up…' : 'Open radar' }}
      </button>
    </form>
  </div>
</template>
