import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookingStatusView } from './BookingStatusView';

export const metadata = {
  title: 'Status Pembayaran | The Hotels',
};

interface StatusBooking {
  id: number;
  user_id: string;
  kode_booking: string;
  status: string;
  total_harga: number;
  rooms: {
    room_types: { nama: string };
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingStatusPage({ params }: PageProps) {
  const { id } = await params;
  const bookingId = parseInt(id, 10);
  if (!Number.isInteger(bookingId)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data } = await supabase
    .from('bookings')
    .select('id, user_id, kode_booking, status, total_harga, rooms ( room_types ( nama ) )')
    .eq('id', bookingId)
    .single();

  const booking = data as unknown as StatusBooking | null;
  if (!booking || booking.user_id !== user.id) notFound();

  const { data: payment } = await supabase
    .from('payments')
    .select('transaction_status')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-emerald-900 px-6 py-16 text-ivory lg:px-20">
      <div className="mb-10 text-center">
        <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Status Pembayaran</span>
      </div>
      <BookingStatusView
        bookingId={booking.id}
        kodeBooking={booking.kode_booking}
        roomName={booking.rooms.room_types.nama}
        totalHarga={booking.total_harga}
        initialBookingStatus={booking.status}
        initialPaymentStatus={payment?.transaction_status ?? null}
      />
    </main>
  );
}
