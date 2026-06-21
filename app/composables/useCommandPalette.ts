export type PaletteMode = 'command' | 'blip'

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
