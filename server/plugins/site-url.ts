export default defineNitroPlugin(() => {
  if (process.env.SITE_URL && !process.env.NUXT_SITE_URL) {
    process.env.NUXT_SITE_URL = process.env.SITE_URL;
  }
});
