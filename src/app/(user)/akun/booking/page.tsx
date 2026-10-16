import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatInTimeZone } from 'date-fns-tz';
import { PAGE_SIZE, BOOKING_STATUSES, TIMEZONE, type BookingStatus } from '@/lib/constants';
import { BookingHistory, type BookingHistoryRow } from './BookingHistory';

export const metadata = {
  title: 'Booking Saya | The Hotels',
};

interface RawBooking {
  id: number;
  kode_booking: string;
  check_in: string;
  check_out: string;
  jumlah_tamu: number;
  total_harga: number;
  status: BookingStatus;
  rooms: { room_types: { nama: string } } | null;
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AkunBookingPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const sp = await searchParams;
  const supabase = await createClient();

  const q = typeof sp.q === 'string' ? sp.q.trim() : '';
  const status = typeof sp.status === 'string' && BOOKING_STATUSES.includes(sp.status as BookingStatus)
    ? sp.status
    : '';
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('bookings')
    .select(
      'id, kode_booking, check_in, check_out, jumlah_tamu, total_harga, status, rooms ( room_types ( nama ) )',
      { count: 'exact' }
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q) query = query.ilike('kode_booking', `%${q}%`);
  if (status) query = query.eq('status', status as BookingStatus);

  const { data, count } = await query;
  const raw = (data ?? []) as unknown as RawBooking[];

  const today = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
  const cancellableIds = raw
    .filter((b) => b.status === 'pending' || (b.status === 'dikonfirmasi' && b.check_in > today))
    .map((b) => b.id);

  const bookings: BookingHistoryRow[] = raw.map((b) => ({
    id: b.id,
    kode_booking: b.kode_booking,
    check_in: b.check_in,
    check_out: b.check_out,
    jumlah_tamu: b.jumlah_tamu,
    total_harga: b.total_harga,
    status: b.status,
    room_name: b.rooms?.room_types?.nama ?? '-',
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-20">
      <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Akun</span>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-ivory">Booking Saya</h1>
      <div className="my-4 mb-10 h-px w-16 bg-gold/40" />
      <BookingHistory
        bookings={bookings}
        total={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        q={q}
        status={status}
        cancellableIds={cancellableIds}
      />
    </div>
  );
}
