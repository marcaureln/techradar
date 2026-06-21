import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { BlipWithHistory, CreateBlipInput, UpdateBlipInput } from '#shared/types';

const KEY = ['blips'] as const;

export function useBlips(archived = false) {
  return useQuery({
    queryKey: archived ? [...KEY, 'archived'] : KEY,
    queryFn: () =>
      $fetch<{ data: BlipWithHistory[] }>('/api/blips', {
        params: archived ? { archived: 'true' } : {},
      }).then((r) => r.data),
  });
}

export function useBlip(id: () => string) {
  return useQuery({
    queryKey: [...KEY, id()],
    queryFn: () => $fetch<{ data: BlipWithHistory }>(`/api/blips/${id()}`).then((r) => r.data),
    enabled: computed(() => !!id()),
  });
}

export function useCreateBlip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBlipInput) =>
      $fetch<{ data: BlipWithHistory }>('/api/blips', { method: 'POST', body: input }).then((r) => r.data),
    onMutate: async (newBlip) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<BlipWithHistory[]>(KEY);
      qc.setQueryData<BlipWithHistory[]>(KEY, (old) => [
        ...(old ?? []),
        {
          ...newBlip,
          id: `optimistic-${Date.now()}`,
          number: (old?.length ?? 0) + 1,
          createdAt: new Date().toISOString(),
          lastEvaluatedAt: new Date().toISOString(),
          isArchived: false,
          history: [],
        },
      ]);
      return { previous };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateBlip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateBlipInput & { id: string }) =>
      $fetch<{ data: BlipWithHistory }>(`/api/blips/${id}`, { method: 'PATCH', body: input }).then((r) => r.data),
    onMutate: async ({ id, ...update }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<BlipWithHistory[]>(KEY);
      qc.setQueryData<BlipWithHistory[]>(KEY, (old) => old?.map((b) => (b.id === id ? { ...b, ...update } : b)));
      return { previous };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useArchiveBlip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      $fetch<{ data: BlipWithHistory }>(`/api/blips/${id}`, { method: 'DELETE' }).then((r) => r.data),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<BlipWithHistory[]>(KEY);
      qc.setQueryData<BlipWithHistory[]>(KEY, (old) => old?.filter((b) => b.id !== id));
      return { previous };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkReviewed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      $fetch<{ data: BlipWithHistory }>(`/api/blips/${id}/review`, { method: 'POST' }).then((r) => r.data),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<BlipWithHistory[]>(KEY);
      const now = new Date().toISOString();
      qc.setQueryData<BlipWithHistory[]>(KEY, (old) =>
        old?.map((b) => (b.id === id ? { ...b, lastEvaluatedAt: now } : b))
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRestoreBlip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      $fetch<{ data: BlipWithHistory }>(`/api/blips/${id}/restore`, { method: 'POST' }).then((r) => r.data),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
