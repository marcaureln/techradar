import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DAY = 86_400_000;

const BLIPS = [
  {
    name: 'JavaScript',
    quadrant: 'languages',
    ring: 'adopt',
    description: 'Core language for web and tooling across the stack.',
  },
  {
    name: 'TypeScript',
    quadrant: 'languages',
    ring: 'adopt',
    description: 'Typed JavaScript for safer, more maintainable code.',
    from: 'trial',
  },
  {
    name: 'Java',
    quadrant: 'languages',
    ring: 'adopt',
    description: 'Mature JVM language for backend services.',
    daysAgo: 110,
  },
  {
    name: 'Python',
    quadrant: 'languages',
    ring: 'adopt',
    description: 'Scripting, automation, and data/ML workloads.',
  },
  {
    name: 'Next.js',
    quadrant: 'languages',
    ring: 'adopt',
    description: 'React framework for full-stack web applications.',
  },

  { name: 'AWS', quadrant: 'platforms', ring: 'adopt', description: 'Primary cloud provider for managed services.' },
  {
    name: 'Hetzner',
    quadrant: 'platforms',
    ring: 'adopt',
    description: 'Cost-effective bare-metal and cloud servers.',
  },
  { name: 'Cloudflare', quadrant: 'platforms', ring: 'adopt', description: 'CDN, DNS, and edge security.' },
  { name: 'GitHub', quadrant: 'platforms', ring: 'adopt', description: 'Source hosting, code review, and Actions CI.' },
  {
    name: 'Kubernetes',
    quadrant: 'platforms',
    ring: 'assess',
    description: 'Container orchestration; evaluating for scaled workloads.',
    daysAgo: 130,
    from: 'hold',
  },

  {
    name: 'Terraform',
    quadrant: 'tools',
    ring: 'adopt',
    description: 'Declarative infrastructure-as-code provisioning.',
  },
  { name: 'PostgreSQL', quadrant: 'tools', ring: 'adopt', description: 'Primary relational database.' },
  { name: 'PostGIS', quadrant: 'tools', ring: 'adopt', description: 'Geospatial extension for PostgreSQL.' },
  {
    name: 'Docker',
    quadrant: 'tools',
    ring: 'adopt',
    description: 'Containerization for build and runtime parity.',
    from: 'trial',
  },

  {
    name: 'Infrastructure-as-Code',
    quadrant: 'techniques',
    ring: 'adopt',
    description: 'Manage infrastructure declaratively and reproducibly.',
  },
  {
    name: 'CI/CD pipelines (GitHub Actions)',
    quadrant: 'techniques',
    ring: 'adopt',
    description: 'Automated build, test, and deploy pipelines.',
  },
  {
    name: 'Cost optimization',
    quadrant: 'techniques',
    ring: 'trial',
    description: 'Actively trimming cloud spend and right-sizing resources.',
    daysAgo: 100,
    from: 'assess',
  },
  {
    name: 'Workflow automation',
    quadrant: 'techniques',
    ring: 'assess',
    description: 'Evaluating automation of internal processes.',
  },
  {
    name: 'Security (SAST/DAST, IAM)',
    quadrant: 'techniques',
    ring: 'assess',
    description: 'Assessing static/dynamic scanning and IAM practices.',
  },
  {
    name: 'FinOps',
    quadrant: 'techniques',
    ring: 'assess',
    description: 'Exploring financial accountability for cloud cost.',
    from: 'trial',
  },
  {
    name: 'Multi-cloud architecture',
    quadrant: 'techniques',
    ring: 'hold',
    description: 'On hold; operational complexity outweighs current benefits.',
    daysAgo: 200,
    from: 'assess',
  },
];

async function main() {
  await prisma.blipHistory.deleteMany();
  await prisma.blip.deleteMany();

  let number = 0;
  for (const { daysAgo, from, ...blip } of BLIPS) {
    number += 1;
    const evaluatedAt = daysAgo ? new Date(Date.now() - daysAgo * DAY) : new Date();
    const created = await prisma.blip.create({
      data: { ...blip, number, lastEvaluatedAt: evaluatedAt },
    });
    if (from) {
      await prisma.blipHistory.create({
        data: { blipId: created.id, fromRing: from, toRing: blip.ring, changedAt: evaluatedAt },
      });
    }
  }

  const count = await prisma.blip.count();
  console.log(`Seeded ${count} blips.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
