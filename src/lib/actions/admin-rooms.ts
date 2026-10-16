'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminOrNull } from '@/lib/auth';
import { roomSchema } from '@/lib/validators';
import { mapError, type ActionResult } from '@/lib/errors';

const FORBIDDEN = { ok: false as const, code: 'FORBIDDEN' as const, message: 'Anda tidak memiliki akses untuk tindakan ini.' };

interface RoomInput {
  nomor_kamar: string;
  room_type_id: number;
  lantai?: number;
  status: 'tersedia' | 'perawatan';
}

function normalize(input: RoomInput) {
  return {
    nomor_kamar: input.nomor_kamar?.trim(),
    room_type_id: Number(input.room_type_id),
    lantai: input.lantai === undefined || input.lantai === null || (input.lantai as unknown) === '' ? undefined : Number(input.lantai),
    status: input.status,
  };
}

export async function createRoom(input: RoomInput): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  const parsed = roomSchema.safeParse(normalize(input));
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data kamar.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('rooms').insert({
    nomor_kamar: parsed.data.nomor_kamar,
    room_type_id: parsed.data.room_type_id,
    lantai: parsed.data.lantai ?? null,
    status: parsed.data.status,
  });

  if (error) return { ok: false, ...mapError(error) };

  revalidatePath('/admin/kamar');
  revalidatePath('/kamar');
  return { ok: true, data: undefined };
}

export async function updateRoom(id: number, input: RoomInput): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  const parsed = roomSchema.safeParse(normalize(input));
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data kamar.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('rooms')
    .update({
      nomor_kamar: parsed.data.nomor_kamar,
      room_type_id: parsed.data.room_type_id,
      lantai: parsed.data.lantai ?? null,
      status: parsed.data.status,
    })
    .eq('id', id);

  if (error) return { ok: false, ...mapError(error) };

  revalidatePath('/admin/kamar');
  revalidatePath('/kamar');
  return { ok: true, data: undefined };
}

export async function deleteRoom(id: number): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  const supabase = await createClient();
  const { error } = await supabase.from('rooms').delete().eq('id', id);

  if (error) {
    if ((error as { code?: string }).code === '23503') {
      return { ok: false, code: 'CONFLICT', message: 'Kamar ini memiliki riwayat booking dan tidak dapat dihapus.' };
    }
    return { ok: false, ...mapError(error) };
  }

  revalidatePath('/admin/kamar');
  revalidatePath('/kamar');
  return { ok: true, data: undefined };
}
