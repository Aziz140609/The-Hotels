import type { ReactNode } from 'react';
import { connection } from 'next/server';
import { PublicShell } from '@/components/layout/public-shell';
import { getSessionUser } from '@/lib/auth';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  await connection();
  const sessionUser = await getSessionUser();
  const user = sessionUser
    ? { nama: sessionUser.nama_lengkap.split(' ')[0], isAdmin: sessionUser.role === 'admin' }
    : null;

  return <PublicShell user={user}>{children}</PublicShell>;
}
