import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Work tech radar seed data. Numbers are assigned sequentially in this order.
const BLIPS = [
  // Languages & Frameworks — Adopt
  { name: 'JavaScript', quadrant: 'languages', ring: 'adopt', description: 'Core language for web and tooling across the stack.' },
  { name: 'TypeScript', quadrant: 'languages', ring: 'adopt', description: 'Typed JavaScript for safer, more maintainable code.' },
  { name: 'Java', quadrant: 'languages', ring: 'adopt', description: 'Mature JVM language for backend services.' },
  { name: 'Python', quadrant: 'languages', ring: 'adopt', description: 'Scripting, automation, and data/ML workloads.' },
  { name: 'Next.js', quadrant: 'languages', ring: 'adopt', description: 'React framework for full-stack web applications.' },

  // Platforms — Adopt
  { name: 'AWS', quadrant: 'platforms', ring: 'adopt', description: 'Primary cloud provider for managed services.' },
  { name: 'Hetzner', quadrant: 'platforms', ring: 'adopt', description: 'Cost-effective bare-metal and cloud servers.' },
  { name: 'Cloudflare', quadrant: 'platforms', ring: 'adopt', description: 'CDN, DNS, and edge security.' },
  { name: 'GitHub', quadrant: 'platforms', ring: 'adopt', description: 'Source hosting, code review, and Actions CI.' },
  // Platforms — Assess
  { name: 'Kubernetes', quadrant: 'platforms', ring: 'assess', description: 'Container orchestration; evaluating for scaled workloads.' },

  // Tools — Adopt
  { name: 'Terraform', quadrant: 'tools', ring: 'adopt', description: 'Declarative infrastructure-as-code provisioning.' },
  { name: 'PostgreSQL', quadrant: 'tools', ring: 'adopt', description: 'Primary relational database.' },
  { name: 'PostGIS', quadrant: 'tools', ring: 'adopt', description: 'Geospatial extension for PostgreSQL.' },
  { name: 'Docker', quadrant: 'tools', ring: 'adopt', description: 'Containerization for build and runtime parity.' },

  // Techniques — Adopt
  { name: 'Infrastructure-as-Code', quadrant: 'techniques', ring: 'adopt', description: 'Manage infrastructure declaratively and reproducibly.' },
  { name: 'CI/CD pipelines (GitHub Actions)', quadrant: 'techniques', ring: 'adopt', description: 'Automated build, test, and deploy pipelines.' },
  // Techniques — Trial
  { name: 'Cost optimization', quadrant: 'techniques', ring: 'trial', description: 'Actively trimming cloud spend and right-sizing resources.' },
  // Techniques — Assess
  { name: 'Workflow automation', quadrant: 'techniques', ring: 'assess', description: 'Evaluating automation of internal processes.' },
  { name: 'Security (SAST/DAST, IAM)', quadrant: 'techniques', ring: 'assess', description: 'Assessing static/dynamic scanning and IAM practices.' },
  { name: 'FinOps', quadrant: 'techniques', ring: 'assess', description: 'Exploring financial accountability for cloud cost.' },
  // Techniques — Hold
  { name: 'Multi-cloud architecture', quadrant: 'techniques', ring: 'hold', description: 'On hold; operational complexity outweighs current benefits.' },
]

async function main() {
  // Replace any existing radar contents with this dataset.
  await prisma.blipHistory.deleteMany()
  await prisma.blip.deleteMany()

  let number = 0
  for (const blip of BLIPS) {
    number += 1
    await prisma.blip.create({ data: { ...blip, number } })
  }

  const count = await prisma.blip.count()
  console.log(`Seeded ${count} blips.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
