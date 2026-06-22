import { useMutation, useQueryClient, type QueryKey } from '@tanstack/vue-query';

function errorMessage(e: unknown): string {
  const err = e as { data?: { message?: string }; statusMessage?: string; message?: string };
  return err?.data?.message || err?.statusMessage || err?.message || 'Something went wrong.';
}

// Wraps a list mutation with the shared optimistic-update plumbing: snapshot +
// rollback on error (with a toast), and invalidate on settle.
export function useListMutation<TVars, TItem>(
  key: QueryKey,
  mutationFn: (vars: TVars) => Promise<unknown>,
  applyOptimistic?: (old: TItem[] | undefined, vars: TVars) => TItem[] | undefined
) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn,
    onMutate: applyOptimistic
      ? async (vars: TVars) => {
          await qc.cancelQueries({ queryKey: key });
          const previous = qc.getQueryData<TItem[]>(key);
          qc.setQueryData<TItem[]>(key, (old) => applyOptimistic(old, vars));
          return { previous };
        }
      : undefined,
    onError: (e, _vars, ctx) => {
      const previous = (ctx as { previous?: TItem[] } | undefined)?.previous;
      if (previous !== undefined) qc.setQueryData(key, previous);
      toast.show(errorMessage(e));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
