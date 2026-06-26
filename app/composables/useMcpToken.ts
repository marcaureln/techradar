import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';

const KEY = ['mcp-token'] as const;

export function useMcpToken(enabled: MaybeRefOrGetter<boolean>) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => $fetch<{ data: { token: string | null } }>('/api/settings/mcp-token').then((r) => r.data.token),
    enabled,
    staleTime: 60_000,
  });

  const regenerate = useMutation({
    mutationFn: () =>
      $fetch<{ data: { token: string } }>('/api/settings/mcp-token', { method: 'POST' }).then((r) => r.data.token),
    onSuccess: (token) => qc.setQueryData(KEY, token),
  });

  return { token: query.data, regenerate };
}
