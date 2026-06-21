import { z } from 'zod'

export const QUADRANT_KEYS = ['techniques', 'tools', 'platforms', 'languages'] as const
export const RING_KEYS = ['adopt', 'trial', 'assess', 'hold'] as const

export type Quadrant = typeof QUADRANT_KEYS[number]
export type Ring = typeof RING_KEYS[number]

export interface Blip {
  id: string
  number: number
  name: string
  quadrant: Quadrant
  ring: Ring
  description: string
  notes: string | null
  isArchived: boolean
  createdAt: string
  lastEvaluatedAt: string
}

export interface BlipHistory {
  id: string
  blipId: string
  fromRing: Ring
  toRing: Ring
  changedAt: string
  changedBy: string
}

export interface BlipWithHistory extends Blip {
  history: BlipHistory[]
}

export interface Settings {
  id: string
  setupDone: boolean
  createdAt: string
  updatedAt: string
}

export type CreateBlipInput = { name: string; quadrant: Quadrant; ring: Ring; description: string; notes?: string }
export type UpdateBlipInput = Partial<CreateBlipInput> & { id?: string }
export type SettingsInput = { setupDone?: boolean }