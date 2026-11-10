import { addDays, format, parseISO } from 'date-fns';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/layout/admin-shell';
import { PAGE_SIZE, BOOKING_STATUSES, type BookingStatus } from '@/lib/constants';
import { BookingTable, type AdminBookingRow } from './BookingTable';

export const metadata = {
  title: 'Booking | Admin The Hotels',
};

interface RawPayment {
  transaction_status: string;
  is_paid: boolean;
  payment_type: string | null;
  order_id: string;
  created_at: string;
}

interface RawBooking {
  id: number;
  kode_booking: string;
  nama_tamu: string;
  email_tamu: string;
  no_hp_tamu: string;
  catatan: string | null;
  check_in: string;
  check_out: string;
  jumlah_tamu: number;
  total_harga: number;
  status: BookingStatus;
  created_at: string;
  rooms: { nomor_kamar: string; room_types: { nama: string } } | null;
  payments: RawPayment[];
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string; page?: string }>;
}

export default async function AdminBookingPage({ searchParams }: PageProps) {
  await connection();
  const sp = await searchParams;
  const supabase = await createClient();

  const q = typeof sp.q === 'string' ? sp.q.trim().replace(/[%,()]/g, '') : '';
  const status = typeof sp.status === 'string' && BOOKING_STATUSES.includes(sp.status as BookingStatus) ? sp.status : '';
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const from = typeof sp.from === 'string' && dateRe.test(sp.from) ? sp.from : '';
  const to = typeof sp.to === 'string' && dateRe.test(sp.to) ? sp.to : '';
  const page = Math.max(1, Number(sp.page) || 1);
  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;

  let query = supabase
    .from('bookings')
    .select(
      'id, kode_booking, nama_tamu, email_tamu, no_hp_tamu, catatan, check_in, check_out, jumlah_tamu, total_harga, status, created_at, rooms ( nomor_kamar, room_types ( nama ) ), payments ( transaction_status, is_paid, payment_type, order_id, created_at )',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(rangeFrom, rangeTo);

  if (q) query = query.or(`kode_booking.ilike.%${q}%,nama_tamu.ilike.%${q}%`);
  if (status) query = query.eq('status', status as BookingStatus);
  if (from) query = query.gte('created_at', `${from}T00:00:00+07:00`);
  if (to) query = query.lt('created_at', `${format(addDays(parseISO(to), 1), 'yyyy-MM-dd')}T00:00:00+07:00`);

  const { data, count } = await query;
  const raw = (data ?? []) as unknown as RawBooking[];

  const rows: AdminBookingRow[] = raw.map((b) => {
    const latest = [...(b.payments ?? [])].sort((x, y) => (x.created_at < y.created_at ? 1 : -1))[0];
    return {
      id: b.id,
      kode_booking: b.kode_booking,
      nama_tamu: b.nama_tamu,
      email_tamu: b.email_tamu,
      no_hp_tamu: b.no_hp_tamu,
      catatan: b.catatan,
      check_in: b.check_in,
      check_out: b.check_out,
      jumlah_tamu: b.jumlah_tamu,
      total_harga: b.total_harga,
      status: b.status,
      room_number: b.rooms?.nomor_kamar ?? '-',
      room_type_name: b.rooms?.room_types?.nama ?? '-',
      created_at: b.created_at,
      payment_status: latest?.transaction_status ?? null,
      payment_is_paid: latest?.is_paid ?? false,
      payment_type: latest?.payment_type ?? null,
      order_id: latest?.order_id ?? null,
    };
  });

  return (
    <AdminShell title="Booking">
      <BookingTable rows={rows} total={count ?? 0} page={page} pageSize={PAGE_SIZE} filters={{ q, status, from, to }} />
    </AdminShell>
  );
}
