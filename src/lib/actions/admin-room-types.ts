'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminOrNull } from '@/lib/auth';
import { roomTypeSchema } from '@/lib/validators';
import { mapError, type ActionResult } from '@/lib/errors';
import { MAX_PHOTO_BYTES, ALLOWED_PHOTO_TYPES } from '@/lib/constants';
import type { Database } from '@/types/database';

const FORBIDDEN = { ok: false as const, code: 'FORBIDDEN' as const, message: 'Anda tidak memiliki akses untuk tindakan ini.' };

async function uploadPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File
): Promise<{ url?: string; error?: string }> {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
    return { error: 'Format foto harus JPG, PNG, atau WEBP.' };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: 'Ukuran foto maksimal 2MB.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('room-photos').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { error: 'Gagal mengunggah foto.' };

  return { url: supabase.storage.from('room-photos').getPublicUrl(path).data.publicUrl };
}

function parseForm(formData: FormData) {
  const foto = formData.get('foto');
  return {
    nama: formData.get('nama'),
    deskripsi: formData.get('deskripsi') || undefined,
    harga_per_malam: Number(formData.get('harga_per_malam')),
    kapasitas: Number(formData.get('kapasitas')),
    fasilitas: formData.getAll('fasilitas').map(String).filter(Boolean),
    foto: foto instanceof File && foto.size > 0 ? foto : undefined,
  };
}

export async function createRoomType(formData: FormData): Promise<ActionResult<{ id: number }>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  const parsed = roomTypeSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data yang Anda isi.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  let fotoUrl: string | null = null;

  if (parsed.data.foto instanceof File) {
    const upload = await uploadPhoto(supabase, parsed.data.foto);
    if (upload.error) return { ok: false, code: 'VALIDATION', message: upload.error };
    fotoUrl = upload.url ?? null;
  }

  const { data, error } = await supabase
    .from('room_types')
    .insert({
      nama: parsed.data.nama,
      deskripsi: parsed.data.deskripsi ?? null,
      harga_per_malam: parsed.data.harga_per_malam,
      kapasitas: parsed.data.kapasitas,
      fasilitas: parsed.data.fasilitas,
      foto_url: fotoUrl,
    })
    .select('id')
    .single();

  if (error) return { ok: false, ...mapError(error) };

  revalidatePath('/admin/tipe-kamar');
  revalidatePath('/kamar');
  return { ok: true, data: { id: data.id } };
}

export async function updateRoomType(id: number, formData: FormData): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  const parsed = roomTypeSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data yang Anda isi.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const update: Database['public']['Tables']['room_types']['Update'] = {
    nama: parsed.data.nama,
    deskripsi: parsed.data.deskripsi ?? null,
    harga_per_malam: parsed.data.harga_per_malam,
    kapasitas: parsed.data.kapasitas,
    fasilitas: parsed.data.fasilitas,
  };

  if (parsed.data.foto instanceof File) {
    const upload = await uploadPhoto(supabase, parsed.data.foto);
    if (upload.error) return { ok: false, code: 'VALIDATION', message: upload.error };
    update.foto_url = upload.url ?? null;
  }

  const { error } = await supabase.from('room_types').update(update).eq('id', id);
  if (error) return { ok: false, ...mapError(error) };

  revalidatePath('/admin/tipe-kamar');
  revalidatePath('/kamar');
  return { ok: true, data: undefined };
}

export async function deleteRoomType(id: number): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  const supabase = await createClient();
  const { error } = await supabase.from('room_types').delete().eq('id', id);

  if (error) {
    if ((error as { code?: string }).code === '23503') {
      return { ok: false, code: 'CONFLICT', message: 'Masih ada kamar bertipe ini. Hapus kamar terlebih dahulu.' };
    }
    return { ok: false, ...mapError(error) };
  }

  revalidatePath('/admin/tipe-kamar');
  revalidatePath('/kamar');
  return { ok: true, data: undefined };
}
