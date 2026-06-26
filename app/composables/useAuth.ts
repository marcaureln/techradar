import { computed } from 'vue';

interface Me {
  secure: boolean;
  provider: string | null;
  user: { email?: string; name?: string; provider?: string } | null;
  canEdit: boolean;
  mcpEnabled: boolean;
}

export function useAuth() {
  const { data, refresh } = useFetch('/api/me', { key: 'me', transform: (r: { data: Me }) => r.data });
  const signingIn = useState('auth:signingIn', () => false);
  const signingOut = useState('auth:signingOut', () => false);

  function signIn() {
    signingIn.value = true;
    return navigateTo('/auth', { external: true });
  }
  async function signOut() {
    signingOut.value = true;
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
      await refresh();
      await navigateTo('/');
    } finally {
      signingOut.value = false;
    }
  }

  return {
    canEdit: computed(() => data.value?.canEdit ?? false),
    secure: computed(() => data.value?.secure ?? false),
    user: computed(() => data.value?.user ?? null),
    provider: computed(() => data.value?.provider ?? null),
    mcpEnabled: computed(() => data.value?.mcpEnabled ?? true),
    refresh,
    signIn,
    signOut,
    signingIn,
    signingOut,
  };
}
