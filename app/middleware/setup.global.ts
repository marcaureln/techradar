export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/setup')) return

  try {
    const data = await $fetch<{ data: { setupDone: boolean } }>('/api/settings')
    if (!data?.data?.setupDone) {
      return navigateTo('/setup')
    }
  } catch {
    return navigateTo('/setup')
  }
})