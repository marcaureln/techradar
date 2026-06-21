import { RING_INDEX } from './constants'
import type { BlipWithHistory } from '../../types/index'

export type BlipDirection = 'up' | 'down' | null

// Movement since the last ring change: 'up' means it moved toward adopt
// (a lower ring index), 'down' toward hold. No history means no direction.
export function blipDirection(blip: Pick<BlipWithHistory, 'history'>): BlipDirection {
  const latest = blip.history?.[0]
  if (!latest) return null
  const from = RING_INDEX[latest.fromRing]
  const to = RING_INDEX[latest.toRing]
  if (to < from) return 'up'
  if (to > from) return 'down'
  return null
}
