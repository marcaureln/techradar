import { writeFile, mkdir } from 'node:fs/promises'
import { extname } from 'node:path'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event)

  if (!files || files.length === 0) {
    fail('No file uploaded')
  }

  const file = files![0]

  if (!ALLOWED_TYPES.includes(file.type ?? '')) {
    fail('Invalid file type. Only images are allowed.')
  }

  if (file.data.length > MAX_SIZE) {
    fail('File too large. Maximum size is 2MB.')
  }

  const ext = extname(file.filename ?? 'image.png') || '.png'
  const logoFilename = `logo${ext}`
  const destPath = getUploadPath(logoFilename)

  await mkdir(getUploadDir(), { recursive: true })
  await writeFile(destPath, file.data)

  const logoPath = `/uploads/${logoFilename}`

  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: { logoPath },
    create: { id: 'singleton', companyName: '', logoPath },
  })

  return ok({ path: logoPath })
})