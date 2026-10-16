import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookingCheckout } from './BookingCheckout';

export const metadata: Metadata = {
  title: 'Checkout | The Hotels',
  description: 'Selesaikan pembayaran booking Anda',
};

interface BookingData {
  id: number;
  kode_booking: string;
  check_in: string;
  check_out: string;
  jumlah_tamu: number;
  total_harga: number;
  status: string;
  expired_at: string | null;
  nama_tamu: string;
  email_tamu: string;
  no_hp_tamu: string;
  catatan: string | null;
  rooms: {
    nomor_kamar: string;
    room_types: {
      nama: string;
      harga_per_malam: number;
      foto_url: string | null;
    };
  };
  user_id: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      rooms (
        nomor_kamar,
        room_types (nama, harga_per_malam, foto_url)
      )
    `)
    .eq('id', parseInt(id))
    .single();

  if (!booking) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const b = booking as BookingData;
  if (!user || b.user_id !== user.id) notFound();

  return (
    <BookingCheckout
      booking={b}
      clientKey={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''}
      isProduction={process.env.MIDTRANS_IS_PRODUCTION === 'true'}
    />
  );
}