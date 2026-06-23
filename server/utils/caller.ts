import type { H3Event } from 'h3';

// Who is making the change, for blip history. The session user's email in secure
// mode; 'system' when there's no authenticated user (insecure mode).
export async function getCallerUsername(event: H3Event): Promise<string> {
  const user = await sessionUser(event);
  return user?.email ?? 'system';
}
