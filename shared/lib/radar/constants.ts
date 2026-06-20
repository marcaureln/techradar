export const QUADRANT_COLORS: Record<string, string> = {
  techniques: '#1D9E75',
  tools: '#534AB7',
  platforms: '#D85A30',
  languages: '#BA7517',
}

export const QUADRANT_LABELS: Record<string, string> = {
  techniques: 'Techniques',
  tools: 'Tools',
  platforms: 'Platforms',
  languages: 'Languages & Frameworks',
}

export const RING_LABELS: Record<string, string> = {
  adopt: 'Adopt',
  trial: 'Trial',
  assess: 'Assess',
  hold: 'Hold',
}

export const QUADRANT_START: Record<string, number> = {
  techniques: 0,
  tools: 270,
  platforms: 180,
  languages: 90,
}

export const RING_OUTER = [57.5, 115, 172.5, 230] as const

export const RING_INDEX: Record<string, number> = {
  adopt: 0,
  trial: 1,
  assess: 2,
  hold: 3,
}

export const CX = 280
export const CY = 280
export const RMAX = 230
export const BLIP_RADIUS = 11