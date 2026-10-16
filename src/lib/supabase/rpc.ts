import type { createClient } from '@/lib/supabase/server';

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export function callRpc<T>(
  supabase: ServerClient,
  name: string,
  params: Record<string, unknown>
): Promise<{ data: T | null; error: unknown }> {
  // RPC generics in supabase-js 2.117 require a full Function overload table;
  // the handwritten Database type only exposes a subset, so we narrow here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc(name, params) as Promise<{ data: T | null; error: unknown }>;
}
