import { createReadStream, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler((event) => {
  const filepath = getRouterParam(event, 'path')

  if (!filepath) {
    fail('No file path provided', 404)
  }

  const uploadDir = getUploadDir()
  const fullPath = join(uploadDir, filepath)

  if (!fullPath.startsWith(uploadDir)) {
    fail('Invalid path', 403)
  }

  if (!existsSync(fullPath)) {
    fail('File not found', 404)
  }

  const stat = statSync(fullPath)
  const ext = fullPath.split('.').pop()?.toLowerCase()

  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
  }

  setHeader(event, 'Content-Type', mimeTypes[ext ?? ''] ?? 'application/octet-stream')
  setHeader(event, 'Content-Length', stat.size.toString())
  setHeader(event, 'Cache-Control', 'public, max-age=86400')

  return sendStream(event, createReadStream(fullPath))
})