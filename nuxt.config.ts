import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import tailwindcss from '@tailwindcss/vite';

const pkg = createRequire(import.meta.url)('./package.json');

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
  'github-logo',
  'copy',
  'bug',
  'arrow-elbow-down-left',
  'spinner-gap',
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

  ssr: false,

  modules: ['@nuxt/eslint', '@nuxt/icon', 'nuxt-auth-utils'],

  icon: {
    serverBundle: { collections: [phSubset] },
    clientBundle: { icons: USED_ICONS.map((n) => `ph:${n}`) },
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-07-01',

  devtools: { enabled: true },

  components: ['~/components'],

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

  $development: {
    runtimeConfig: {
      session: { cookie: { secure: false } },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Tech Radar',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/satoshi-400.woff2', crossorigin: '' },
      ],
    },
  },
});
