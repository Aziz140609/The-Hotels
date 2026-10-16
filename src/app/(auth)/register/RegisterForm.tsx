'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/actions/auth';

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [values, setValues] = useState({
    nama_lengkap: '',
    email: '',
    no_hp: '',
    password: '',
    konfirmasi: '',
  });
  const [setuju, setSetuju] = useState(false);

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await signUp({ ...values, setuju });
    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      setIsSubmitting(false);
      return;
    }

    if (!result.data.needsConfirmation) {
      router.replace(next && next.startsWith('/') ? next : '/');
      router.refresh();
      return;
    }

    setSuccess(true);
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-serif text-2xl text-ivory">Periksa Email Anda</p>
        <p className="text-[13px] text-muted-ivory">
          Kami telah mengirim tautan konfirmasi ke email Anda. Konfirmasi untuk mengaktifkan akun, lalu masuk.
        </p>
        <Link href={loginHref} className="inline-block text-gold hover:text-ivory">Ke Halaman Masuk</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <p role="alert" className="text-[13px] text-danger">{formError}</p>}
      <FormField id="nama" label="Nama Lengkap" error={fieldErrors.nama_lengkap?.[0]}>
        <Input id="nama" name="nama_lengkap" autoComplete="name" placeholder="Nama lengkap Anda" value={values.nama_lengkap} onChange={set('nama_lengkap')} required />
      </FormField>
      <FormField id="email" label="Email" error={fieldErrors.email?.[0]}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="email@anda.com" value={values.email} onChange={set('email')} required />
      </FormField>
      <FormField id="phone" label="Nomor HP" error={fieldErrors.no_hp?.[0]}>
        <Input id="phone" name="no_hp" type="tel" autoComplete="tel" placeholder="081234567890" value={values.no_hp} onChange={set('no_hp')} />
      </FormField>
      <FormField id="password" label="Password" error={fieldErrors.password?.[0]}>
        <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" value={values.password} onChange={set('password')} required />
      </FormField>
      <FormField id="konfirmasi" label="Konfirmasi Password" error={fieldErrors.konfirmasi?.[0]}>
        <Input id="konfirmasi" name="konfirmasi" type="password" autoComplete="new-password" placeholder="Ulangi password" value={values.konfirmasi} onChange={set('konfirmasi')} required />
      </FormField>
      <div>
        <Checkbox id="setuju" label="Saya menyetujui syarat dan ketentuan yang berlaku" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} />
        {fieldErrors.setuju?.[0] && <p role="alert" className="mt-1 text-[12px] text-danger">{fieldErrors.setuju[0]}</p>}
      </div>
      <Button type="submit" loading={isSubmitting} className="w-full py-4">Daftar</Button>
      <p className="text-center text-[13px] text-muted-ivory">
        Sudah punya akun?{' '}
        <Link href={loginHref} className="text-gold hover:text-ivory">Masuk</Link>
      </p>
    </form>
  );
}
