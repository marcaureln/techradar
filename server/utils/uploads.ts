import { join } from 'node:path'

export function getUploadDir() {
  return process.env.UPLOAD_DIR || '/data/uploads'
}

export function getUploadPath(filename: string) {
  return join(getUploadDir(), filename)
}