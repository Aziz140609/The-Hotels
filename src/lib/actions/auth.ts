'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/lib/errors';
import { mapError } from '@/lib/errors';
import { sanitizeRedirect } from '@/lib/redirect';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
  profileSchema,
  changePasswordSchema,
} from '@/lib/validators';

async function clientIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function signIn(
  input: Record<string, unknown>
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data Anda.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const ip = await clientIp();
  if (!checkRateLimit(`login:${parsed.data.email}:${ip}`, 30, 300_000)) {
    return { ok: false, code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan masuk. Tunggu beberapa menit lalu coba lagi.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { ok: false, code: 'UNAUTHENTICATED', message: 'Email belum dikonfirmasi. Periksa kotak masuk Anda.' };
    }
    return { ok: false, code: 'UNAUTHENTICATED', message: 'Email atau password salah.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const next = sanitizeRedirect(typeof input.next === 'string' ? input.next : null);
  const redirectTo = next !== '/' ? next : profile?.role === 'admin' ? '/admin' : '/';

  return { ok: true, data: { redirectTo } };
}

export async function signUp(
  input: Record<string, unknown>
): Promise<ActionResult<{ needsConfirmation: boolean }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data Anda.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (!checkRateLimit(`register:${await clientIp()}`, 10, 3_600_000)) {
    return { ok: false, code: 'RATE_LIMITED', message: 'Terlalu banyak pendaftaran. Tunggu beberapa saat lalu coba lagi.' };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        nama_lengkap: parsed.data.nama_lengkap,
        no_hp: parsed.data.no_hp ?? null,
      },
      emailRedirectTo: `${siteUrl}/api/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { ok: false, code: 'CONFLICT', message: 'Email sudah terdaftar. Silakan masuk.' };
    }
    return { ok: false, ...mapError(error) };
  }

  return { ok: true, data: { needsConfirmation: !data.session } };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function requestPasswordReset(
  input: Record<string, unknown>
): Promise<ActionResult<void>> {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data Anda.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/reset-password`,
  });

  return { ok: true, data: undefined };
}

export async function resetPassword(
  input: Record<string, unknown>
): Promise<ActionResult<void>> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data Anda.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, ...mapError(error) };

  await supabase.auth.signOut({ scope: 'others' });
  return { ok: true, data: undefined };
}

export async function updateProfile(
  input: Record<string, unknown>
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: 'UNAUTHENTICATED', message: 'Silakan masuk terlebih dahulu.' };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data Anda.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      nama_lengkap: parsed.data.nama_lengkap,
      no_hp: parsed.data.no_hp ?? null,
    })
    .eq('id', user.id);

  if (error) return { ok: false, ...mapError(error) };
  return { ok: true, data: undefined };
}

export async function changePassword(
  input: Record<string, unknown>
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, code: 'UNAUTHENTICATED', message: 'Silakan masuk terlebih dahulu.' };

  const currentPassword = typeof input.current_password === 'string' ? input.current_password : '';
  if (!currentPassword) {
    return { ok: false, code: 'VALIDATION', message: 'Password saat ini wajib diisi.', fieldErrors: { current_password: ['Wajib diisi'] } };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Periksa kembali data Anda.', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (authError) {
    return { ok: false, code: 'UNAUTHENTICATED', message: 'Password saat ini salah.', fieldErrors: { current_password: ['Password salah'] } };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password_baru });
  if (error) return { ok: false, ...mapError(error) };

  return { ok: true, data: undefined };
}
