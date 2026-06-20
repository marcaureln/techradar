export type PaletteMode = 'command' | 'blip'

// Shared open-state + mode for the command palette. Cmd/Ctrl+K opens the
// command menu; "/" (or the "Search blips" command) opens blip search.
export function useCommandPalette() {
  const open = useState('cmdk-open', () => false)
  const mode = useState<PaletteMode>('cmdk-mode', () => 'command')

  return {
    open,
    mode,
    show: () => {
      mode.value = 'command'
      open.value = true
    },
    showBlips: () => {
      mode.value = 'blip'
      open.value = true
    },
    hide: () => (open.value = false),
    toggle: () => {
      mode.value = 'command'
      open.value = !open.value
    },
  }
}
