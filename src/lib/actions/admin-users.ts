'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminOrNull } from '@/lib/auth';
import { adminUserSchema, adminUserEditSchema } from '@/lib/validators';
import { mapError, type ActionResult } from '@/lib/errors';

const FORBIDDEN = { ok: false as const, code: 'FORBIDDEN' as const, message: 'Anda tidak memiliki akses untuk tindakan ini.' };

interface CreateUserInput {
  nama_lengkap: string;
  email: string;
  no_hp?: string;
  password: string;
  role: 'admin' | 'user';
}

interface EditUserInput {
  nama_lengkap: string;
  no_hp?: string;
  role: 'admin' | 'user';
}

export async function createUser(input: CreateUserInput): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  const parsed = adminUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data pengguna.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      nama_lengkap: parsed.data.nama_lengkap,
      no_hp: parsed.data.no_hp ?? '',
    },
  });

  if (error) {
    if (error.status === 422 || /already registered|exists/i.test(error.message)) {
      return { ok: false, code: 'CONFLICT', message: 'Email sudah terdaftar.' };
    }
    return { ok: false, ...mapError(error) };
  }

  if (parsed.data.role === 'admin' && data.user) {
    const { error: roleError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
    if (roleError) return { ok: false, ...mapError(roleError) };
  }

  revalidatePath('/admin/pengguna');
  return { ok: true, data: undefined };
}

export async function updateUser(id: string, input: EditUserInput): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  if (id === admin.id && input.role !== 'admin') {
    return { ok: false, code: 'FORBIDDEN_ROLE_CHANGE', message: 'Anda tidak dapat menurunkan peran akun sendiri.' };
  }

  const parsed = adminUserEditSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data pengguna.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      nama_lengkap: parsed.data.nama_lengkap,
      no_hp: parsed.data.no_hp ?? null,
      role: parsed.data.role,
    })
    .eq('id', id);

  if (error) return { ok: false, ...mapError(error) };

  revalidatePath('/admin/pengguna');
  return { ok: true, data: undefined };
}

export async function deleteUser(id: string): Promise<ActionResult<void>> {
  const admin = await getAdminOrNull();
  if (!admin) return FORBIDDEN;

  if (id === admin.id) {
    return { ok: false, code: 'FORBIDDEN', message: 'Anda tidak dapat menghapus akun sendiri.' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) {
    if (/foreign key|booking|constraint/i.test(error.message)) {
      return { ok: false, code: 'CONFLICT', message: 'Pengguna memiliki riwayat booking dan tidak dapat dihapus.' };
    }
    return { ok: false, ...mapError(error) };
  }

  revalidatePath('/admin/pengguna');
  return { ok: true, data: undefined };
}
