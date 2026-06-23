export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/setup')) return;

  const verified = useState('setup-verified', () => false);
  if (verified.value) return;

  try {
    const data = await $fetch<{ data: { setupDone: boolean } }>('/api/settings');
    if (data?.data?.setupDone) {
      verified.value = true;
      return;
    }
    // Not set up yet: only editors are sent to onboarding. In secure mode an
    // anonymous (read-only) visitor just sees the empty radar.
    const me = await $fetch<{ data: { canEdit: boolean } }>('/api/me');
    if (me?.data?.canEdit) return navigateTo('/setup');
  } catch {
    return navigateTo('/setup');
  }
});
