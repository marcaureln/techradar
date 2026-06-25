export default defineNitroPlugin(() => {
  const providers = configuredProviders();

  if (providers.length > 1) {
    throw new Error(`Tech Radar: configure only ONE OAuth provider, found: ${providers.join(', ')}.`);
  }

  const secure = providers.length === 1;
  if (secure && process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    throw new Error('Tech Radar: secure mode needs SESSION_SECRET (>= 32 chars) for session cookies.');
  }

  // nuxt-auth-utils maps NUXT_SESSION_PASSWORD per request and needs it non-empty
  // (its /api/_auth/session seals a cookie even in open mode, where it's unused).
  if (!process.env.NUXT_SESSION_PASSWORD) {
    process.env.NUXT_SESSION_PASSWORD =
      process.env.SESSION_SECRET || 'techradar-open-mode-unused-session-password-0000';
  }
});
