import type { CreateBlipInput } from '../types/index';

// Seed blips used when an operator chooses "start with sample blips" during
// onboarding. A spread across all four quadrants and rings so a fresh radar
// looks alive on first open.
// reviewDaysAgo backdates the last evaluation so a few blips start overdue
// (>90 days), surfacing the "needs review" state on a fresh radar.
export type SampleBlip = CreateBlipInput & { reviewDaysAgo?: number };

export const SAMPLE_BLIPS: SampleBlip[] = [
  {
    name: 'TypeScript',
    quadrant: 'languages',
    ring: 'adopt',
    description: 'Typed superset of JavaScript for safer, more maintainable code.',
  },
  {
    name: 'React',
    quadrant: 'languages',
    ring: 'adopt',
    description: 'Component-based library for building user interfaces.',
  },
  {
    name: 'Rust',
    quadrant: 'languages',
    ring: 'assess',
    description: 'Memory-safe systems language; evaluating for performance-critical services.',
  },
  {
    name: 'jQuery',
    quadrant: 'languages',
    ring: 'hold',
    description: 'Legacy DOM library; prefer modern frameworks for new work.',
    reviewDaysAgo: 120,
  },

  {
    name: 'Trunk-based development',
    quadrant: 'techniques',
    ring: 'adopt',
    description: 'Short-lived branches merged to trunk frequently to reduce integration pain.',
  },
  {
    name: 'Feature flags',
    quadrant: 'techniques',
    ring: 'trial',
    description: 'Decouple deploy from release to ship safely and experiment.',
  },
  {
    name: 'Contract testing',
    quadrant: 'techniques',
    ring: 'assess',
    description: 'Verify service integrations against agreed contracts.',
    reviewDaysAgo: 135,
  },

  {
    name: 'Docker',
    quadrant: 'tools',
    ring: 'adopt',
    description: 'Containers for reproducible build and runtime environments.',
  },
  {
    name: 'Playwright',
    quadrant: 'tools',
    ring: 'trial',
    description: 'Reliable end-to-end browser testing across engines.',
  },
  {
    name: 'OpenTelemetry',
    quadrant: 'tools',
    ring: 'assess',
    description: 'Vendor-neutral tracing and metrics instrumentation.',
  },

  {
    name: 'Kubernetes',
    quadrant: 'platforms',
    ring: 'trial',
    description: 'Container orchestration for scalable workloads.',
    reviewDaysAgo: 105,
  },
  {
    name: 'Self-hosted CI runners',
    quadrant: 'platforms',
    ring: 'hold',
    description: 'High maintenance overhead; prefer managed CI where possible.',
  },
];
