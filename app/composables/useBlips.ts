import { useQuery } from '@tanstack/vue-query';
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
  return useListMutation<CreateBlipInput, BlipWithHistory>(
    KEY,
    (input) => $fetch<{ data: BlipWithHistory }>('/api/blips', { method: 'POST', body: input }).then((r) => r.data),
    (old, newBlip) => [
      ...(old ?? []),
      {
        ...newBlip,
        id: `optimistic-${Date.now()}`,
        number: (old?.length ?? 0) + 1,
        createdAt: new Date().toISOString(),
        lastEvaluatedAt: new Date().toISOString(),
        isArchived: false,
        history: [],
      } as BlipWithHistory,
    ]
  );
}

export function useUpdateBlip() {
  return useListMutation<UpdateBlipInput & { id: string }, BlipWithHistory>(
    KEY,
    ({ id, ...input }) =>
      $fetch<{ data: BlipWithHistory }>(`/api/blips/${id}`, { method: 'PATCH', body: input }).then((r) => r.data),
    (old, { id, ...update }) => old?.map((b) => (b.id === id ? { ...b, ...update } : b))
  );
}

export function useArchiveBlip() {
  return useListMutation<string, BlipWithHistory>(
    KEY,
    (id) => $fetch<{ data: BlipWithHistory }>(`/api/blips/${id}`, { method: 'DELETE' }).then((r) => r.data),
    (old, id) => old?.filter((b) => b.id !== id)
  );
}

export function useMarkReviewed() {
  return useListMutation<string, BlipWithHistory>(
    KEY,
    (id) => $fetch<{ data: BlipWithHistory }>(`/api/blips/${id}/review`, { method: 'POST' }).then((r) => r.data),
    (old, id) => {
      const now = new Date().toISOString();
      return old?.map((b) => (b.id === id ? { ...b, lastEvaluatedAt: now } : b));
    }
  );
}

export function useRestoreBlip() {
  return useListMutation<string, BlipWithHistory>(KEY, (id) =>
    $fetch<{ data: BlipWithHistory }>(`/api/blips/${id}/restore`, { method: 'POST' }).then((r) => r.data)
  );
}
