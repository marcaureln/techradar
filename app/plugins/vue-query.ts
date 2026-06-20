import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxt) => {
  nuxt.vueApp.use(VueQueryPlugin, {
    queryClient: new QueryClient({
      defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
    }),
  })
})