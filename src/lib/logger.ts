import { randomBytes } from 'crypto';

const SENSITIVE_KEYS = ['password', 'token', 'snap_token', 'authorization', 'key', 'secret'];

function redact(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value;
  if (Array.isArray(value)) return value.map(redact);
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    result[k] = SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s)) ? '[REDACTED]' : redact(v);
  }
  return result;
}

export function logError(
  context: string,
  error: unknown,
  meta?: Record<string, unknown>
) {
  const errorId = randomBytes(4).toString('hex').toUpperCase();
  const entry = {
    level: 'error',
    errorId,
    context,
    code: (error as { code?: string })?.code,
    message: (error as { message?: string })?.message ?? 'Unknown error',
    userId: meta?.userId,
    route: meta?.route,
    meta: redact(meta),
    time: new Date().toISOString(),
  };
  console.error(JSON.stringify(entry));
}
