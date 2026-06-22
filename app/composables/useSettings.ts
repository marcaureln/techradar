import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { Settings, SettingsInput } from '#shared/types';

const KEY = ['settings'] as const;

export function useSettings() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => $fetch<{ data: Settings }>('/api/settings').then((r) => r.data),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SettingsInput) =>
      $fetch<{ data: Settings }>('/api/settings', { method: 'PATCH', body: input }).then((r) => r.data),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<Settings>(KEY);
      qc.setQueryData<Settings>(KEY, (old) => ({ ...old, ...input }) as Settings);
      return { previous };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
