'use server';

import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ActionResult } from '@/lib/errors';
import { mapError } from '@/lib/errors';
import { contactSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';

export async function submitContact(
  input: Record<string, unknown>
): Promise<ActionResult<void>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data Anda.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.website) {
    return { ok: true, data: undefined };
  }

  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(`contact:${ip}`, 5, 3_600_000)) {
    return { ok: false, code: 'RATE_LIMITED', message: 'Terlalu banyak pesan. Tunggu beberapa saat lalu coba lagi.' };
  }

  const admin = createAdminClient();
  const { error } = await admin.from('messages').insert({
    nama: parsed.data.nama,
    email: parsed.data.email,
    subjek: parsed.data.subjek,
    pesan: parsed.data.pesan,
  });

  if (error) return { ok: false, ...mapError(error) };

  return { ok: true, data: undefined };
}
