import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HOTEL } from '@/lib/constants';
import { formatRupiah, formatDate } from '@/lib/format';
import { PAYMENT_STATUS_LABELS } from '@/lib/constants';
import { PrintButton } from './PrintButton';

export const metadata = {
  title: 'Bukti Booking | The Hotels',
};

interface ProofBooking {
  id: number;
  user_id: string;
  kode_booking: string;
  check_in: string;
  check_out: string;
  jumlah_tamu: number;
  total_harga: number;
  status: string;
  nama_tamu: string;
  email_tamu: string;
  no_hp_tamu: string;
  created_at: string;
  rooms: { nomor_kamar: string; room_types: { nama: string; harga_per_malam: number } };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BuktiPage({ params }: PageProps) {
  const { id } = await params;
  const bookingId = parseInt(id, 10);
  if (!Number.isInteger(bookingId)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data } = await supabase
    .from('bookings')
    .select(
      'id, user_id, kode_booking, check_in, check_out, jumlah_tamu, total_harga, status, nama_tamu, email_tamu, no_hp_tamu, created_at, rooms ( nomor_kamar, room_types ( nama, harga_per_malam ) )'
    )
    .eq('id', bookingId)
    .single();

  const booking = data as unknown as ProofBooking | null;
  if (!booking || booking.user_id !== user.id) notFound();

  const { data: payment } = await supabase
    .from('payments')
    .select('transaction_status, order_id, payment_type')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nights = Math.max(
    1,
    Math.round((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000)
  );

  return (
    <main className="min-h-screen bg-emerald-900 px-6 py-12 text-ivory lg:px-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link href="/akun/booking" className="text-[12px] uppercase tracking-widest text-gold hover:text-ivory">
            ← Booking Saya
          </Link>
          <PrintButton />
        </div>

        <article className="border border-gold/30 bg-emerald-800/40 p-8 print:border-black print:bg-white print:text-black">
          <header className="border-b border-gold/30 pb-6 text-center print:border-black">
            <h1 className="font-serif text-3xl tracking-[0.2em]">{HOTEL.name.toUpperCase()}</h1>
            <p className="mt-2 text-[12px] text-muted-ivory print:text-black">{HOTEL.address}</p>
            <p className="text-[12px] text-muted-ivory print:text-black">{HOTEL.phone} · {HOTEL.email}</p>
          </header>

          <h2 className="mt-6 text-center font-serif text-2xl">Bukti Pemesanan</h2>
          <p className="mt-1 text-center text-[12px] text-gold print:text-black">{booking.kode_booking}</p>

          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <Row label="Nama Tamu" value={booking.nama_tamu} />
            <Row label="Email" value={booking.email_tamu} />
            <Row label="No. HP" value={booking.no_hp_tamu} />
            <Row label="Jumlah Tamu" value={`${booking.jumlah_tamu} orang`} />
            <Row label="Tipe Kamar" value={booking.rooms.room_types.nama} />
            <Row label="Nomor Kamar" value={booking.rooms.nomor_kamar} />
            <Row label="Check-in" value={`${formatDate(booking.check_in)} (${HOTEL.checkInTime})`} />
            <Row label="Check-out" value={`${formatDate(booking.check_out)} (${HOTEL.checkOutTime})`} />
            <Row label="Lama Menginap" value={`${nights} malam`} />
            <Row label="Tanggal Pesan" value={formatDate(booking.created_at)} />
          </dl>

          <div className="mt-8 border-t border-gold/30 pt-6 print:border-black">
            <div className="flex justify-between text-sm">
              <span className="text-muted-ivory print:text-black">
                {booking.rooms.room_types.nama} × {nights} malam
              </span>
              <span>{formatRupiah(booking.rooms.room_types.harga_per_malam * nights)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-gold/20 pt-3 print:border-black">
              <span className="font-serif text-lg">Total</span>
              <span className="font-serif text-xl">{formatRupiah(booking.total_harga)}</span>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-muted-ivory print:text-black">Status Pembayaran</span>
              <span>{payment ? PAYMENT_STATUS_LABELS[payment.transaction_status] ?? payment.transaction_status : 'Belum ada pembayaran'}</span>
            </div>
            {payment?.order_id && (
              <div className="mt-2 flex justify-between text-[12px] text-muted-ivory print:text-black">
                <span>Order ID</span>
                <span>{payment.order_id}</span>
              </div>
            )}
          </div>

          <p className="mt-8 border-t border-gold/20 pt-6 text-center text-[11px] text-muted-ivory print:border-black print:text-black">
            Bukti ini diterbitkan otomatis oleh sistem {HOTEL.name}. Tunjukkan bukti ini saat check-in.
          </p>
        </article>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gold/10 pb-2 sm:flex-col sm:gap-1 sm:border-0 sm:pb-0">
      <dt className="text-[11px] uppercase tracking-widest text-gold print:text-black">{label}</dt>
      <dd className="text-[14px] text-ivory print:text-black">{value}</dd>
    </div>
  );
}
