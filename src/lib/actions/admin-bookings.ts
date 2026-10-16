'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminOrNull } from '@/lib/auth';
import { bookingStatusSchema } from '@/lib/validators';
import { mapError, type ActionResult } from '@/lib/errors';
import type { Database } from '@/types/database';

const FORBIDDEN = { ok: false as const, code: 'FORBIDDEN' as const, message: 'Anda tidak memiliki akses untuk tindakan ini.' };

type BookingStatus = Database['public']['Tables']['bookings']['Row']['status'];

const ALLOWED_TRANSITIONS: Record<string, BookingStatus[]> = {
  dikonfirmasi: ['checked_in', 'dibatalkan'],
  checked_in: ['selesai'],
};

export async function updateBookingStatus(input: {
  bookingId: number;
  status: string;
}): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  const parsed = bookingStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Perubahan status tidak valid.' };
  }

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', parsed.data.bookingId)
    .single();

  if (readError || !current) {
    return { ok: false, code: 'BOOKING_NOT_FOUND', message: 'Booking tidak ditemukan.' };
  }

  const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
  if (!allowed.includes(parsed.data.status)) {
    return { ok: false, code: 'INVALID_STATUS_TRANSITION', message: 'Status booking sudah berubah. Muat ulang halaman lalu coba lagi.' };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.bookingId);

  if (error) return { ok: false, ...mapError(error) };

  revalidatePath('/admin/booking');
  revalidatePath('/admin');
  return { ok: true, data: undefined };
}

export async function updateBookingNote(input: {
  bookingId: number;
  catatan: string;
}): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  const catatan = input.catatan.trim();
  if (catatan.length > 500) {
    return { ok: false, code: 'VALIDATION', message: 'Catatan maksimal 500 karakter.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('bookings')
    .update({ catatan: catatan || null })
    .eq('id', input.bookingId);

  if (error) return { ok: false, ...mapError(error) };

  revalidatePath('/admin/booking');
  return { ok: true, data: undefined };
}

export async function deleteBooking(id: number): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id)
    .eq('status', 'dibatalkan')
    .select('id');

  if (error) return { ok: false, ...mapError(error) };
  if (!data || data.length === 0) {
    return { ok: false, code: 'CANCEL_NOT_ALLOWED', message: 'Hanya booking yang sudah dibatalkan yang dapat dihapus.' };
  }

  revalidatePath('/admin/booking');
  revalidatePath('/admin');
  return { ok: true, data: undefined };
}
