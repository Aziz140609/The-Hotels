import type { ReactNode } from 'react';
import { connection } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await connection();
  await requireAdmin();
  return <>{children}</>;
}
