'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { requestPasswordReset } from '@/lib/actions/auth';

export function ForgotForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await requestPasswordReset({ email });
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setIsSubmitting(false);
      return;
    }

    setSent(true);
    setIsSubmitting(false);
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-serif text-2xl text-ivory">Tautan Terkirim</p>
        <p className="text-[13px] text-muted-ivory">
          Jika email tersebut terdaftar, kami telah mengirim tautan reset password. Periksa kotak masuk Anda.
        </p>
        <Link href="/login" className="inline-block text-gold hover:text-ivory">Kembali ke Masuk</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField id="email" label="Email" error={fieldErrors.email?.[0]}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="email@anda.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </FormField>
      <Button type="submit" loading={isSubmitting} className="w-full py-4">Kirim Tautan Reset</Button>
      <p className="text-center text-[13px] text-muted-ivory">
        Ingat password?{' '}
        <Link href="/login" className="text-gold hover:text-ivory">Masuk</Link>
      </p>
    </form>
  );
}
