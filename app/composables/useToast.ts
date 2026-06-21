export interface Toast {
  id: number
  message: string
  actionLabel?: string
  action?: () => void
}

let counter = 0

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function show(
    message: string,
    opts: { actionLabel?: string; action?: () => void; duration?: number } = {},
  ) {
    const id = ++counter
    toasts.value = [...toasts.value, { id, message, actionLabel: opts.actionLabel, action: opts.action }]
    const duration = opts.duration ?? 5000
    if (duration > 0) setTimeout(() => dismiss(id), duration)
    return id
  }

  return { toasts, show, dismiss }
}
