import type { ReactNode } from 'react';
import { PublicShell } from '@/components/layout/public-shell';
import { getSessionUser } from '@/lib/auth';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser();
  const user = sessionUser
    ? { nama: sessionUser.nama_lengkap.split(' ')[0], isAdmin: sessionUser.role === 'admin' }
    : null;

  return <PublicShell user={user}>{children}</PublicShell>;
}
