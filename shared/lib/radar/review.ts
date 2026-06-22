import type { Blip } from '../../types/index';
import { MS_PER_DAY } from './constants';

const REVIEW_DAYS = 90;

export function isDue(blip: Pick<Blip, 'lastEvaluatedAt'>): boolean {
  const elapsed = Date.now() - new Date(blip.lastEvaluatedAt).getTime();
  return elapsed > REVIEW_DAYS * MS_PER_DAY;
}

export function daysUntilDue(blip: Pick<Blip, 'lastEvaluatedAt'>): number {
  const elapsed = Date.now() - new Date(blip.lastEvaluatedAt).getTime();
  return Math.max(0, REVIEW_DAYS - Math.floor(elapsed / MS_PER_DAY));
}
