import type { Blip } from '../../types/index'

const REVIEW_DAYS = 90
const MS_PER_DAY = 86_400_000

export function isDue(blip: Pick<Blip, 'lastEvaluatedAt'>): boolean {
  const elapsed = Date.now() - new Date(blip.lastEvaluatedAt).getTime()
  return elapsed > REVIEW_DAYS * MS_PER_DAY
}

export function daysUntilDue(blip: Pick<Blip, 'lastEvaluatedAt'>): number {
  const elapsed = Date.now() - new Date(blip.lastEvaluatedAt).getTime()
  return Math.max(0, REVIEW_DAYS - Math.floor(elapsed / MS_PER_DAY))
}