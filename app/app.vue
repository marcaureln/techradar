<script setup lang="ts">
import { computed } from 'vue';

const { data: settings } = useFetch('/api/settings', {
  transform: (r: { data: { name: string | null; description: string | null } }) => r.data,
});

const DEFAULT_DESCRIPTION =
  'A self-hosted tech radar to track technology adoption across techniques, tools, platforms, and languages.';
const title = computed(() => (settings.value?.name ? `${settings.value.name} Tech Radar` : 'Tech Radar'));
const description = computed(() => settings.value?.description || DEFAULT_DESCRIPTION);

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary',
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
