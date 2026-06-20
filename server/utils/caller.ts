import type { H3Event } from 'h3'
import { getHeader } from 'h3'

export function getCallerUsername(event: H3Event): string {
  return (
    getHeader(event, 'x-authentik-username')
    ?? getHeader(event, 'x-forwarded-user')
    ?? getHeader(event, 'x-remote-user')
    ?? 'system'
  )
}