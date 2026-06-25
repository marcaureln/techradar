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
    const me = await $fetch<{ data: { canEdit: boolean } }>('/api/me');
    if (me?.data?.canEdit) return navigateTo('/setup');
  } catch {
    return navigateTo('/setup');
  }
});
