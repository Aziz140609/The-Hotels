import type { ReactNode } from 'react';
import { connection } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await connection();
  await requireAdmin();
  return <>{children}</>;
}
