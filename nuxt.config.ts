import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  modules: ['@nuxt/fonts', '@prisma/nuxt'],

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-07-01',

  devtools: { enabled: true },

  components: [
    { path: '~/components', ignore: ['ui/**'] },
  ],

  alias: {
    '#shared': resolve(__dirname, 'shared'),
  },

  nitro: {
    alias: {
      '#shared': resolve(__dirname, 'shared'),
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@prisma/nuxt > @prisma/client',
        '@tanstack/vue-table',
        '@vueuse/core',
      ],
    },
    server: {
      allowedHosts: true,
    },
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL ?? `file:${resolve(__dirname, 'prisma/techradar.db')}`,
  },

  app: {
    head: {
      title: 'Tech Radar',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      meta: [
        { name: 'description', content: 'Track technology adoption across your organization' },
      ],
    },
  },
})