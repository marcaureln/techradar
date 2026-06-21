import { RING_INDEX } from './constants';
import type { BlipWithHistory } from '../../types/index';

export type BlipDirection = 'up' | 'down' | null;

export function blipDirection(blip: Pick<BlipWithHistory, 'history'>): BlipDirection {
  const latest = blip.history?.[0];
  if (!latest) return null;
  const from = RING_INDEX[latest.fromRing];
  const to = RING_INDEX[latest.toRing];
  if (to < from) return 'up';
  if (to > from) return 'down';
  return null;
}

const NEW_DAYS = 30;

// A blip is "new" when it was added recently and has never moved rings.
export function isNewBlip(blip: Pick<BlipWithHistory, 'history' | 'createdAt'>): boolean {
  if (blip.history?.length) return false;
  return Date.now() - new Date(blip.createdAt).getTime() < NEW_DAYS * 86_400_000;
}
