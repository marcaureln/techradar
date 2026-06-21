export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/setup')) return

  // Verify setup once per session, then skip — otherwise this refetches
  // /api/settings on every navigation, including ?blip query changes.
  const verified = useState('setup-verified', () => false)
  if (verified.value) return

  try {
    const data = await $fetch<{ data: { setupDone: boolean } }>('/api/settings')
    if (!data?.data?.setupDone) {
      return navigateTo('/setup')
    }
    verified.value = true
  } catch {
    return navigateTo('/setup')
  }
})