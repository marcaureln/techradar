export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/setup')) return

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