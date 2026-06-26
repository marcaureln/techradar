export default withOAuthErrorHandling(
  defineOAuthGoogleEventHandler({
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: ['email', 'profile'],
      redirectURL: oauthRedirectURL('google'),
    },
    async onSuccess(event, { user }) {
      await setUserSession(event, { user: { email: user.email, name: user.name, provider: 'google' } });
      return sendRedirect(event, '/');
    },
    onError: onOAuthError,
  })
);
