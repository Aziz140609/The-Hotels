import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  MIDTRANS_SERVER_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().min(1).optional(),
  MIDTRANS_IS_PRODUCTION: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  CRON_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `Environment variable validation failed:\n${missing}\n\nCheck .env.local against .env.example.`
    );
  }
  _env = parsed.data;
  return _env;
}
