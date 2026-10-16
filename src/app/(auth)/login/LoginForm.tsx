'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/actions/auth';

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [values, setValues] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await signIn({ ...values, next });
    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      setIsSubmitting(false);
      return;
    }

    router.push(result.data.redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <p role="alert" className="text-[13px] text-danger">{formError}</p>}
      <FormField id="email" label="Email" error={fieldErrors.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="email@anda.com"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          required
        />
      </FormField>
      <FormField id="password" label="Password" error={fieldErrors.password?.[0]}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Masukkan password"
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          required
        />
      </FormField>
      <div className="flex justify-end">
        <Link href="/lupa-password" className="text-[11px] uppercase tracking-wide text-gold hover:text-ivory">Lupa Password?</Link>
      </div>
      <Button type="submit" loading={isSubmitting} className="w-full py-4">Masuk</Button>
      <p className="text-center text-[13px] text-muted-ivory">
        Belum punya akun?{' '}
        <Link href="/register" className="text-gold hover:text-ivory">Daftar Sekarang</Link>
      </p>
    </form>
  );
}
