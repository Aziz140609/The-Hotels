import { NextRequest, NextResponse } from 'next/server';
import { createCoreApiClient, verifySignature } from '@/lib/midtrans';
import { applyMidtransStatus, type NormalizedStatus } from '@/lib/payments/apply-status';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/database';

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (raw.length > 100 * 1024) {
    return NextResponse.json({ ok: false, message: 'Payload too large' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const orderId = body.order_id;
  const statusCode = body.status_code;
  const grossAmount = body.gross_amount;
  const signatureKey = body.signature_key;
  const transactionStatus = body.transaction_status;

  if (
    typeof orderId !== 'string' ||
    typeof statusCode !== 'string' ||
    typeof grossAmount !== 'string' ||
    typeof signatureKey !== 'string' ||
    typeof transactionStatus !== 'string'
  ) {
    return NextResponse.json({ ok: false, message: 'Missing fields' }, { status: 400 });
  }

  if (!verifySignature(orderId, statusCode, grossAmount, signatureKey)) {
    console.warn('Midtrans notification: invalid signature for', orderId);
    return NextResponse.json({ ok: false, message: 'Invalid signature' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: payment } = await supabase
    .from('payments')
    .select('id, order_id')
    .eq('order_id', orderId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ ok: true });
  }

  let status: NormalizedStatus = {
    order_id: orderId,
    transaction_status: transactionStatus,
    fraud_status: typeof body.fraud_status === 'string' ? body.fraud_status : null,
    payment_type: typeof body.payment_type === 'string' ? body.payment_type : null,
    transaction_id: typeof body.transaction_id === 'string' ? body.transaction_id : null,
    transaction_time: typeof body.transaction_time === 'string' ? body.transaction_time : null,
    settlement_time: typeof body.settlement_time === 'string' ? body.settlement_time : null,
    gross_amount: grossAmount,
    raw_notification: body as unknown as Json,
  };

  try {
    const core = createCoreApiClient();
    const remote = await core.transaction.status(orderId);
    if (remote && remote.transaction_status) {
      status = {
        order_id: remote.order_id ?? orderId,
        transaction_status: remote.transaction_status,
        fraud_status: remote.fraud_status ?? null,
        payment_type: remote.payment_type ?? null,
        transaction_id: remote.transaction_id ?? null,
        transaction_time: remote.transaction_time ?? null,
        settlement_time: remote.settlement_time ?? null,
        gross_amount: remote.gross_amount,
        raw_notification: body as unknown as Json,
      };
    }
  } catch {
    // fall back to the verified notification body
  }

  try {
    await applyMidtransStatus(status);
  } catch (err) {
    console.error('applyMidtransStatus failed:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
