export default defineOAuthOidcEventHandler({
  config: {
    clientId: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    openidConfig: process.env.OIDC_ISSUER,
    scope: ['openid', 'profile', 'email'],
  },
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      user: { email: user.email, name: user.name ?? user.preferred_username, provider: 'oidc' },
    });
    return sendRedirect(event, '/');
  },
  onError: onOAuthError,
});
