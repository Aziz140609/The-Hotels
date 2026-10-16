import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createSnapClient } from '@/lib/midtrans';
import { mapError } from '@/lib/errors';
import { checkRateLimit } from '@/lib/rate-limit';

interface BookingRow {
  id: number;
  user_id: string;
  check_in: string;
  check_out: string;
  total_harga: number;
  status: string;
  expired_at: string | null;
  nama_tamu: string;
  email_tamu: string;
  no_hp_tamu: string;
  rooms: {
    nomor_kamar: string;
    room_types: {
      id: number;
      nama: string;
      harga_per_malam: number;
    };
  };
  payments: {
    id: number;
    order_id: string;
    snap_token: string | null;
    transaction_status: string;
    created_at: string;
  }[];
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  let body: { bookingId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: 'VALIDATION', message: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const bookingId = Number(body.bookingId);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ ok: false, code: 'VALIDATION', message: 'Booking tidak valid.' }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED', message: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  if (!checkRateLimit(`create-tx:${user.id}`, 10, 600_000)) {
    return NextResponse.json({ ok: false, code: 'RATE_LIMITED', message: 'Terlalu banyak permintaan pembayaran. Tunggu sebentar.' }, { status: 429 });
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id, user_id, check_in, check_out, total_harga, status, expired_at,
      nama_tamu, email_tamu, no_hp_tamu,
      rooms ( nomor_kamar, room_types ( id, nama, harga_per_malam ) ),
      payments ( id, order_id, snap_token, transaction_status, created_at )
    `)
    .eq('id', bookingId)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, code: 'NOT_FOUND', message: 'Booking tidak ditemukan.' }, { status: 404 });
  }

  const b = data as unknown as BookingRow;

  if (b.user_id !== user.id) {
    return NextResponse.json({ ok: false, code: 'NOT_FOUND', message: 'Booking tidak ditemukan.' }, { status: 404 });
  }
  if (b.status !== 'pending') {
    return NextResponse.json({ ok: false, code: 'CONFLICT', message: 'Booking tidak bisa dibayar.' }, { status: 409 });
  }
  if (!b.expired_at || new Date(b.expired_at).getTime() - Date.now() < 120000) {
    return NextResponse.json({ ok: false, code: 'CONFLICT', message: 'Waktu pembayaran habis' }, { status: 409 });
  }

  const reusable = b.payments.find(
    (p) => p.transaction_status === 'pending' && p.snap_token
  );
  if (reusable?.snap_token) {
    return NextResponse.json({ ok: true, data: { token: reusable.snap_token } });
  }

  const nights = Math.round(
    (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000
  );
  const pricePerNight = b.rooms.room_types.harga_per_malam;
  const grossAmount = nights * pricePerNight;

  const orderId = `ORD-${b.id}-${Math.floor(Date.now() / 1000)}`;
  const admin = createAdminClient();

  const { data: payment, error: paymentError } = await admin
    .from('payments')
    .insert({
      booking_id: b.id,
      order_id: orderId,
      gross_amount: grossAmount,
      transaction_status: 'pending',
    })
    .select()
    .single();

  if (paymentError || !payment) {
    return NextResponse.json({ ok: false, ...mapError(paymentError) }, { status: 500 });
  }

  const remainingMinutes = Math.max(
    1,
    Math.ceil((new Date(b.expired_at).getTime() - Date.now()) / 60000)
  );

  try {
    const snap = createSnapClient();
    const transaction = await snap.createTransaction({
      transaction_details: { order_id: orderId, gross_amount: grossAmount },
      item_details: [
        {
          id: `ROOMTYPE-${b.rooms.room_types.id}`,
          name: `${b.rooms.room_types.nama} (${nights} malam)`.slice(0, 50),
          price: pricePerNight,
          quantity: nights,
        },
      ],
      customer_details: {
        first_name: b.nama_tamu,
        email: b.email_tamu,
        phone: b.no_hp_tamu,
      },
      expiry: { unit: 'minute', duration: remainingMinutes },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/${b.id}/status`,
      },
    });

    await admin
      .from('payments')
      .update({ snap_token: transaction.token })
      .eq('id', payment.id);

    return NextResponse.json({ ok: true, data: { token: transaction.token } });
  } catch (err) {
    await admin.from('payments').delete().eq('id', payment.id);
    console.error('Midtrans createTransaction failed:', err);
    return NextResponse.json(
      { ok: false, code: 'EXTERNAL_SERVICE', message: 'Layanan pembayaran sedang bermasalah. Coba lagi sesaat lagi.' },
      { status: 502 }
    );
  }
}