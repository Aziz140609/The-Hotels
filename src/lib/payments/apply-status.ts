import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database, Json } from '@/types/database';

type TransactionStatus =
  Database['public']['Tables']['payments']['Row']['transaction_status'];

export interface NormalizedStatus {
  order_id: string;
  transaction_status: string;
  fraud_status?: string | null;
  payment_type?: string | null;
  transaction_id?: string | null;
  transaction_time?: string | null;
  settlement_time?: string | null;
  gross_amount: string;
  raw_notification?: Json | null;
}

const RANK: Record<string, number> = {
  pending: 0,
  authorize: 1,
  capture: 1,
  deny: 2,
  failure: 2,
  cancel: 2,
  expire: 2,
  settlement: 3,
  refund: 4,
  partial_refund: 4,
  chargeback: 4,
  partial_chargeback: 4,
};

export function statusRank(status: string): number {
  return RANK[status] ?? 1;
}

function isPaid(status: string, fraud: string | null): boolean {
  if (status === 'settlement') return true;
  if (status === 'capture' && (fraud ?? 'accept') === 'accept') return true;
  return false;
}

async function confirmBooking(admin: SupabaseClient<Database>, paymentId: number, bookingId: number) {
  const { data: booking } = await admin
    .from('bookings')
    .select('id, status')
    .eq('id', bookingId)
    .maybeSingle();
  if (!booking) return;

  if (booking.status === 'pending') {
    await admin
      .from('bookings')
      .update({ status: 'dikonfirmasi' })
      .eq('id', bookingId)
      .eq('status', 'pending');
    return;
  }

  if (booking.status === 'dibatalkan') {
    const { error } = await admin
      .from('bookings')
      .update({ status: 'dikonfirmasi' })
      .eq('id', bookingId)
      .eq('status', 'dibatalkan');
    if (error && error.code === '23P01') {
      await admin.from('payments').update({ needs_review: true }).eq('id', paymentId);
    }
  }
}

async function maybeCancelBooking(admin: SupabaseClient<Database>, paymentId: number, bookingId: number) {
  const { data: booking } = await admin
    .from('bookings')
    .select('id, status')
    .eq('id', bookingId)
    .maybeSingle();
  if (!booking || booking.status !== 'pending') return;

  const { data: others } = await admin
    .from('payments')
    .select('id, transaction_status, fraud_status, is_paid')
    .eq('booking_id', bookingId)
    .neq('id', paymentId);

  const hasActive = (others ?? []).some(
    (p) =>
      p.is_paid ||
      p.transaction_status === 'pending' ||
      p.transaction_status === 'authorize' ||
      (p.transaction_status === 'capture' && (p.fraud_status ?? 'accept') === 'accept')
  );
  if (hasActive) return;

  await admin
    .from('bookings')
    .update({ status: 'dibatalkan' })
    .eq('id', bookingId)
    .eq('status', 'pending');
}

export async function applyMidtransStatus(status: NormalizedStatus): Promise<void> {
  const admin = createAdminClient();

  const { data: payment } = await admin
    .from('payments')
    .select('*')
    .eq('order_id', status.order_id)
    .maybeSingle();

  if (!payment) return;

  if (Number(status.gross_amount) !== Number(payment.gross_amount)) {
    await admin.from('payments').update({ needs_review: true }).eq('id', payment.id);
    return;
  }

  const ts = status.transaction_status;
  const newRank = statusRank(ts);
  const storedRank = statusRank(payment.transaction_status);
  if (newRank < storedRank) return;

  await admin
    .from('payments')
    .update({
      transaction_status: ts as TransactionStatus,
      fraud_status: status.fraud_status ?? null,
      payment_type: status.payment_type ?? null,
      transaction_id: status.transaction_id ?? null,
      transaction_time: status.transaction_time ?? null,
      settlement_time: status.settlement_time ?? null,
      raw_notification: status.raw_notification ?? null,
    })
    .eq('id', payment.id);

  const fraud = status.fraud_status ?? null;

  if (isPaid(ts, fraud)) {
    await confirmBooking(admin, payment.id, payment.booking_id);
  } else if (ts === 'capture' && fraud === 'challenge') {
    await admin.from('payments').update({ needs_review: true }).eq('id', payment.id);
  } else if (ts === 'cancel' || ts === 'expire' || ts === 'deny' || ts === 'failure') {
    await maybeCancelBooking(admin, payment.id, payment.booking_id);
  } else if (ts.startsWith('refund') || ts.startsWith('chargeback')) {
    await admin.from('payments').update({ needs_review: true }).eq('id', payment.id);
  }
}
