import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/layout/admin-shell';
import { PAGE_SIZE } from '@/lib/constants';
import { UserManager, type AdminUserRow } from './UserManager';

export const metadata = {
  title: 'Pengguna | Admin The Hotels',
};

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const supabase = await createClient();

  const q = typeof sp.q === 'string' ? sp.q.trim().replace(/[%,()]/g, '') : '';
  const role = sp.role === 'admin' || sp.role === 'user' ? sp.role : '';
  const page = Math.max(1, Number(sp.page) || 1);
  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;

  let query = supabase
    .from('profiles')
    .select('id, nama_lengkap, email, no_hp, role, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(rangeFrom, rangeTo);

  if (q) query = query.or(`nama_lengkap.ilike.%${q}%,email.ilike.%${q}%`);
  if (role) query = query.eq('role', role as 'admin' | 'user');

  const { data, count } = await query;
  const rows = (data ?? []) as AdminUserRow[];

  return (
    <AdminShell title="Pengguna">
      <UserManager
        rows={rows}
        total={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ q, role }}
        currentAdminId={admin.id}
      />
    </AdminShell>
  );
}
