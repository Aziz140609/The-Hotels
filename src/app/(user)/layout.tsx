import type { ReactNode } from 'react';
import { PublicShell } from '@/components/layout/public-shell';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function UserLayout({ children }: { children: ReactNode }) {
  await requireUser();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let nama = user?.email ?? 'Akun';
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nama_lengkap, role')
      .eq('id', user.id)
      .single();
    if (profile) {
      nama = profile.nama_lengkap;
      isAdmin = profile.role === 'admin';
    }
  }

  return <PublicShell user={{ nama: nama.split(' ')[0], isAdmin }}>{children}</PublicShell>;
}
