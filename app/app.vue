<script setup lang="ts">
import { computed } from 'vue';

// Settings drive the page title/description for SEO; fetched on the server so
// crawlers see them in the initial HTML.
const { data: settings } = await useFetch('/api/settings', {
  transform: (r: { data: { name: string | null; description: string | null } }) => r.data,
});

const url = useRequestURL();
const siteUrl = `${url.origin}/`;
const ogImage = `${url.origin}/techradar-logo.svg`;

const DEFAULT_DESCRIPTION =
  'A self-hosted tech radar to track technology adoption across techniques, tools, platforms, and languages.';
const title = computed(() => (settings.value?.name ? `${settings.value.name} Tech Radar` : 'Tech Radar'));
const description = computed(() => settings.value?.description || DEFAULT_DESCRIPTION);

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
});

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogSiteName: title,
  ogTitle: title,
  ogDescription: description,
  ogUrl: siteUrl,
  ogImage,
  twitterCard: 'summary',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImage,
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
