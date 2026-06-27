import type { EventHandler, H3Event } from 'h3';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const PROVIDERS = ['google', 'microsoft', 'github', 'oidc'] as const;
export type Provider = (typeof PROVIDERS)[number];

export function configuredProviders(): Provider[] {
  return PROVIDERS.filter((p) => !!process.env[`${p.toUpperCase()}_CLIENT_ID`]);
}

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
  if (list.length === 0) return true;
  return !!email && list.includes(email.toLowerCase());
}

export interface SessionUser {
  email?: string;
  name?: string;
  provider?: string;
}

export async function sessionUser(event: H3Event): Promise<SessionUser | null> {
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
  if (!isSecure()) return envFlag(process.env.MCP_ENABLED, true);
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  return settings?.mcpEnabled ?? true;
}

export function generateMcpToken(): string {
  return `tr_mcp_${randomBytes(24).toString('base64url')}`;
}

export async function getMcpToken(): Promise<string | null> {
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  return settings?.mcpToken ?? null;
}

export async function mcpCanWrite(event: H3Event): Promise<boolean> {
  if (!isSecure()) return false;
  const stored = await getMcpToken();
  if (!stored) return false;
  const header = getHeader(event, 'authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(stored);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function oauthRedirectURL(provider: Provider): string | undefined {
  const base = process.env.SITE_URL?.replace(/\/+$/, '');
  return base ? `${base}/auth/${provider}` : undefined;
}

export function onOAuthError(event: H3Event, error: unknown) {
  const detail = (error as { data?: unknown })?.data ?? (error instanceof Error ? error.message : error);
  console.error('[auth] sign-in failed:', detail);
  return sendRedirect(event, '/?auth_error=1');
}

export function withOAuthErrorHandling(handler: EventHandler): EventHandler {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event);
    } catch (error) {
      return onOAuthError(event, error);
    }
  });
}
