import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/layout/admin-shell';
import { PAGE_SIZE } from '@/lib/constants';
import { MessageManager, type AdminMessageRow } from './MessageManager';

export const metadata = {
  title: 'Pesan Masuk | Admin The Hotels',
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  await connection();
  await requireAdmin();
  const sp = await searchParams;
  const supabase = await createClient();

  const q = typeof sp.q === 'string' ? sp.q.trim().replace(/[%,()]/g, '') : '';
  const status = sp.status === 'unread' || sp.status === 'read' ? sp.status : 'semua';
  const page = Math.max(1, Number(sp.page) || 1);
  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;

  let query = supabase
    .from('messages')
    .select('id, nama, email, subjek, pesan, is_read, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(rangeFrom, rangeTo);

  if (q) {
    query = query.or(`nama.ilike.%${q}%,email.ilike.%${q}%,subjek.ilike.%${q}%,pesan.ilike.%${q}%`);
  }
  if (status === 'unread') {
    query = query.eq('is_read', false);
  } else if (status === 'read') {
    query = query.eq('is_read', true);
  }

  const [{ data, count }, { count: unreadCount }] = await Promise.all([
    query,
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false),
  ]);

  const rows = (data ?? []) as AdminMessageRow[];

  return (
    <AdminShell title="Pesan Masuk">
      <MessageManager
        rows={rows}
        total={count ?? 0}
        unreadCount={unreadCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ q, status }}
      />
    </AdminShell>
  );
}

