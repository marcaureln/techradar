export default defineNitroPlugin(() => {
  const providers = configuredProviders();

  if (providers.length > 1) {
    throw new Error(`Tech Radar: configure only ONE OAuth provider, found: ${providers.join(', ')}.`);
  }

  const secure = providers.length === 1;
  if (secure && process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    throw new Error('Tech Radar: secure mode needs SESSION_SECRET (>= 32 chars) for session cookies.');
  }

  if (!process.env.NUXT_SESSION_PASSWORD) {
    process.env.NUXT_SESSION_PASSWORD =
      process.env.SESSION_SECRET || 'techradar-open-mode-unused-session-password-0000';
  }
});
