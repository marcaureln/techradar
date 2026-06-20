// Shared open-state for the Cmd/Ctrl+K command palette.
export function useCommandPalette() {
  const open = useState('cmdk-open', () => false)
  return {
    open,
    show: () => (open.value = true),
    hide: () => (open.value = false),
    toggle: () => (open.value = !open.value),
  }
}
