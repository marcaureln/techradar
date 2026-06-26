export default withOAuthErrorHandling(
  defineOAuthGitHubEventHandler({
    config: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      emailRequired: true,
      redirectURL: oauthRedirectURL('github'),
    },
    async onSuccess(event, { user }) {
      await setUserSession(event, { user: { email: user.email, name: user.name ?? user.login, provider: 'github' } });
      return sendRedirect(event, '/');
    },
    onError: onOAuthError,
  })
);
