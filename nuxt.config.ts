import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import tailwindcss from '@tailwindcss/vite';

const pkg = createRequire(import.meta.url)('./package.json');

// Build a minimal Phosphor collection with only the icons the app uses, so the
// server bundle ships those icons instead of the whole ~9k-icon set.
const USED_ICONS = [
  'plus',
  'minus',
  'x',
  'link',
  'check',
  'arrow-up',
  'arrow-down',
  'info',
  'warning',
  'gear-six',
  'sign-in',
  'sign-out',
];
const phFull = createRequire(import.meta.url)('@iconify-json/ph/icons.json');
const phSubset = {
  prefix: phFull.prefix,
  width: phFull.width,
  height: phFull.height,
  icons: Object.fromEntries(USED_ICONS.filter((n) => phFull.icons[n]).map((n) => [n, phFull.icons[n]])),
};

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
    'nuxt-auth-utils',
  ],

  // Self-hosted: the public URL varies per operator. Set TECHRADAR_SITE_URL to
  // get absolute sitemap/canonical URLs; otherwise it is inferred from the request.
  site: {
    name: 'Tech Radar',
    url: process.env.TECHRADAR_SITE_URL,
  },

  // Onboarding is internal — keep it out of search indexes and the sitemap.
  routeRules: {
    '/setup': { robots: false },
  },

  // Ship only the icons actually used instead of the whole Phosphor
  // collection. Keeps the bundle small and fully offline (server + client).
  icon: {
    serverBundle: { collections: [phSubset] },
    clientBundle: { icons: USED_ICONS.map((n) => `ph:${n}`) },
  },

  css: ['~/assets/css/main.css'],

  // Self-hosted at build; Satoshi for body, Bitcount Prop Single for the title.
  fonts: {
    families: [
      { name: 'Satoshi', provider: 'fontshare', weights: [400, 500], styles: ['normal'] },
      { name: 'Bitcount Prop Single', provider: 'google', weights: [400], styles: ['normal'] },
    ],
  },

  compatibilityDate: '2025-07-01',

  devtools: { enabled: true },

  components: [{ path: '~/components', ignore: ['ui/**'] }],

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
        '@tanstack/vue-query',
        '@tanstack/vue-table',
        '@unhead/schema-org/vue',
        '@vee-validate/zod',
        '@vueuse/core',
        'motion-v',
        'reka-ui',
        'vee-validate',
        'zod',
      ],
    },
    server: {
      allowedHosts: true,
    },
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL ?? `file:${resolve(__dirname, 'prisma/techradar.db')}`,
    public: {
      version: pkg.version,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Tech Radar',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
});
