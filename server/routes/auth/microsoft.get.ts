export default withOAuthErrorHandling(
  defineOAuthMicrosoftEventHandler({
    config: {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      redirectURL: oauthRedirectURL('microsoft'),
    },
    async onSuccess(event, { user }) {
      await setUserSession(event, {
        user: { email: user.mail ?? user.userPrincipalName, name: user.displayName, provider: 'microsoft' },
      });
      return sendRedirect(event, '/');
    },
    onError: onOAuthError,
  })
);
