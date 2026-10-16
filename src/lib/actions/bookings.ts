'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/lib/errors';
import { bookingInputSchema, bookingGuestSchema } from '@/lib/validators';
import { mapError } from '@/lib/errors';

interface BookingRow {
  id: number;
  status: string;
  user_id: string;
}

function callRpc<T>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
  params: Record<string, unknown>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc(name, params) as Promise<{ data: T | null; error: unknown }>;
}

export async function createBooking(
  params: Record<string, unknown>
): Promise<ActionResult<{ bookingId: number }>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: 'UNAUTHENTICATED', message: 'Silakan masuk terlebih dahulu.' };

  const parsed = bookingInputSchema.safeParse(params);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Parameter booking tidak valid', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { roomTypeId, checkIn, checkOut, guests } = parsed.data;

  const rpcParams = {
    p_room_type_id: roomTypeId,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_jumlah_tamu: guests,
    p_nama_tamu: user.user_metadata?.nama_lengkap ?? user.email ?? 'Tamu',
    p_email_tamu: user.email ?? '',
    p_no_hp_tamu: user.user_metadata?.no_hp ?? '',
    p_catatan: '',
  };

  const { data, error } = await callRpc<{ id: number }>(supabase, 'create_booking', rpcParams);

  if (error) return { ok: false, ...mapError(error) };

  return { ok: true, data: { bookingId: data!.id } };
}

export async function updateBookingGuest(
  bookingId: number,
  params: Record<string, unknown>
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: 'UNAUTHENTICATED', message: 'Silakan masuk terlebih dahulu.' };

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, user_id')
    .eq('id', bookingId)
    .single();

  const b = booking as BookingRow | null;
  if (!b || b.user_id !== user.id) {
    return { ok: false, code: 'NOT_FOUND', message: 'Booking tidak ditemukan.' };
  }
  if (b.status !== 'pending') {
    return { ok: false, code: 'CONFLICT', message: 'Booking tidak bisa diubah.' };
  }

  const parsed = bookingGuestSchema.safeParse(params);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Data tamu tidak valid', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('bookings')
    .update({
      nama_tamu: parsed.data.nama,
      email_tamu: parsed.data.email,
      no_hp_tamu: parsed.data.hp,
      catatan: parsed.data.catatan,
    })
    .eq('id', bookingId);

  if (error) return { ok: false, ...mapError(error) };

  return { ok: true, data: undefined };
}

export async function cancelBooking(
  bookingId: number
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: 'UNAUTHENTICATED', message: 'Silakan masuk terlebih dahulu.' };

  const { error } = await callRpc<unknown>(supabase, 'cancel_booking', { p_booking_id: bookingId });

  if (error) return { ok: false, ...mapError(error) };

  return { ok: true, data: undefined };
}