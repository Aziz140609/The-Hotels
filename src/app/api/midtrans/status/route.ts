import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCoreApiClient } from '@/lib/midtrans';
import { applyMidtransStatus, type NormalizedStatus } from '@/lib/payments/apply-status';
import type { Json } from '@/types/database';

const STALE_MS = 10_000;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED', message: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  const bookingId = Number(request.nextUrl.searchParams.get('bookingId'));
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ ok: false, code: 'VALIDATION', message: 'Booking tidak valid.' }, { status: 400 });
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, user_id, status')
    .eq('id', bookingId)
    .single();

  if (!booking || booking.user_id !== user.id) {
    return NextResponse.json({ ok: false, code: 'NOT_FOUND', message: 'Booking tidak ditemukan.' }, { status: 404 });
  }

  let { data: payment } = await supabase
    .from('payments')
    .select('id, order_id, transaction_status, created_at')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    payment &&
    payment.transaction_status === 'pending' &&
    Date.now() - new Date(payment.created_at).getTime() > STALE_MS
  ) {
    try {
      const core = createCoreApiClient();
      const remote = await core.transaction.status(payment.order_id);
      if (remote && remote.transaction_status) {
        const status: NormalizedStatus = {
          order_id: remote.order_id ?? payment.order_id,
          transaction_status: remote.transaction_status,
          fraud_status: remote.fraud_status ?? null,
          payment_type: remote.payment_type ?? null,
          transaction_id: remote.transaction_id ?? null,
          transaction_time: remote.transaction_time ?? null,
          settlement_time: remote.settlement_time ?? null,
          gross_amount: remote.gross_amount,
          raw_notification: remote as unknown as Json,
        };
        await applyMidtransStatus(status);

        const [{ data: refreshedPayment }, { data: refreshedBooking }] = await Promise.all([
          supabase
            .from('payments')
            .select('id, order_id, transaction_status, created_at')
            .eq('id', payment.id)
            .maybeSingle(),
          supabase.from('bookings').select('status').eq('id', bookingId).single(),
        ]);
        payment = refreshedPayment ?? payment;
        if (refreshedBooking) booking.status = refreshedBooking.status;
      }
    } catch {
      // keep current state; the poll will retry
    }
  }

  const paymentStatus = payment?.transaction_status ?? null;
  const final = paymentStatus ? paymentStatus !== 'pending' : booking.status !== 'pending';

  return NextResponse.json({
    ok: true,
    data: { bookingStatus: booking.status, paymentStatus, final },
  });
}
