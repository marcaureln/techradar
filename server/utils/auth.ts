import type { H3Event } from 'h3';

const PROVIDERS = ['google', 'microsoft', 'github', 'oidc'] as const;
export type Provider = (typeof PROVIDERS)[number];

export function configuredProviders(): Provider[] {
  return PROVIDERS.filter((p) => !!process.env[`${p.toUpperCase()}_CLIENT_ID`]);
}

// Secure mode is implicit: it's on as soon as one OAuth provider is configured.
export function activeProvider(): Provider | null {
  return configuredProviders()[0] ?? null;
}

export function isSecure(): boolean {
  return activeProvider() !== null;
}

function editorEmails(): string[] {
  return (process.env.EDITOR_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(email?: string | null): boolean {
  const list = editorEmails();
  if (list.length === 0) return true; // no list -> any authenticated user can edit
  return !!email && list.includes(email.toLowerCase());
}

export interface SessionUser {
  email?: string;
  name?: string;
  provider?: string;
}

export async function sessionUser(event: H3Event): Promise<SessionUser | null> {
  // No provider configured means no session cookie (and no session password to
  // unseal it with), so there is never a user to read.
  if (!isSecure()) return null;
  const { user } = await getUserSession(event);
  return (user as SessionUser) ?? null;
}

export async function canEdit(event: H3Event): Promise<boolean> {
  if (!isSecure()) return true;
  const user = await sessionUser(event);
  return !!user && isAllowed(user.email);
}

function envFlag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '') return fallback;
  return !['false', '0', 'no', 'off'].includes(value.trim().toLowerCase());
}

export async function mcpEnabled(): Promise<boolean> {
  // Open mode has no in-app admin, so MCP is controlled by the MCP_ENABLED env var
  // (default on). In secure mode it's the persisted, admin-toggleable setting.
  if (!isSecure()) return envFlag(process.env.MCP_ENABLED, true);
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  return settings?.mcpEnabled ?? true;
}

// Send the user back to the read-only radar instead of a raw 500 when an OAuth
// sign-in fails (e.g. the session cookie didn't survive the provider round-trip).
export function onOAuthError(event: H3Event, error: unknown) {
  console.error('[auth] sign-in failed:', error instanceof Error ? error.message : error);
  return sendRedirect(event, '/?auth_error=1');
}
