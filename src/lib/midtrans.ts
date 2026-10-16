import 'server-only';

import Midtrans from 'midtrans-client';
import crypto from 'crypto';
import { getEnv } from '@/lib/env';

export function createSnapClient() {
  const env = getEnv();
  return new Midtrans.Snap({
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    serverKey: env.MIDTRANS_SERVER_KEY!,
    clientKey: env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  });
}

export function createCoreApiClient() {
  const env = getEnv();
  return new Midtrans.CoreApi({
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    serverKey: env.MIDTRANS_SERVER_KEY!,
    clientKey: env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  });
}

export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const env = getEnv();
  const expected = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${env.MIDTRANS_SERVER_KEY}`)
    .digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signatureKey, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
