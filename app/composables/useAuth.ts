import { computed } from 'vue';

interface Me {
  secure: boolean;
  provider: string | null;
  user: { email?: string; name?: string; provider?: string } | null;
  canEdit: boolean;
  mcpEnabled: boolean;
}

// Server-resolved auth state (SSR-rendered, shared via the 'me' key). In insecure
// mode canEdit is always true, so the edit UI behaves exactly as before.
export function useAuth() {
  const { data, refresh } = useFetch('/api/me', { key: 'me', transform: (r: { data: Me }) => r.data });
  return {
    canEdit: computed(() => data.value?.canEdit ?? false),
    secure: computed(() => data.value?.secure ?? false),
    user: computed(() => data.value?.user ?? null),
    provider: computed(() => data.value?.provider ?? null),
    mcpEnabled: computed(() => data.value?.mcpEnabled ?? true),
    refresh,
  };
}
