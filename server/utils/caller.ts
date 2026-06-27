import type { H3Event } from 'h3';

export async function getCallerUsername(event: H3Event): Promise<string> {
  const user = await sessionUser(event);
  return user?.email ?? 'system';
}
