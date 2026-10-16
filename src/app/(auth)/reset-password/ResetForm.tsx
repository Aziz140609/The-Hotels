'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/lib/actions/auth';
import { toast } from 'sonner';

export function ResetForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [values, setValues] = useState({ password: '', konfirmasi: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await resetPassword(values);
    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      setIsSubmitting(false);
      return;
    }

    toast.success('Password berhasil diperbarui. Silakan masuk kembali.');
    router.push('/login');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <p role="alert" className="text-[13px] text-danger">{formError}</p>}
      <FormField id="password" label="Password Baru" error={fieldErrors.password?.[0]}>
        <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" value={values.password} onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))} required />
      </FormField>
      <FormField id="konfirmasi" label="Konfirmasi Password Baru" error={fieldErrors.konfirmasi?.[0]}>
        <Input id="konfirmasi" name="konfirmasi" type="password" autoComplete="new-password" placeholder="Ulangi password baru" value={values.konfirmasi} onChange={(e) => setValues((v) => ({ ...v, konfirmasi: e.target.value }))} required />
      </FormField>
      <Button type="submit" loading={isSubmitting} className="w-full py-4">Simpan Password Baru</Button>
      <p className="text-center text-[13px] text-muted-ivory">
        <Link href="/login" className="text-gold hover:text-ivory">Kembali ke Masuk</Link>
      </p>
    </form>
  );
}
