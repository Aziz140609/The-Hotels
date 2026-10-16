'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { changePassword } from '@/lib/actions/auth';
import { toast } from 'sonner';

export function PasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [values, setValues] = useState({ current_password: '', password_baru: '', konfirmasi: '' });

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await changePassword(values);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      toast.error(result.message);
      setIsSubmitting(false);
      return;
    }

    toast.success('Password berhasil diubah');
    setValues({ current_password: '', password_baru: '', konfirmasi: '' });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField id="current_password" label="Password Saat Ini" error={fieldErrors.current_password?.[0]}>
        <Input id="current_password" type="password" autoComplete="current-password" value={values.current_password} onChange={set('current_password')} required />
      </FormField>
      <FormField id="password_baru" label="Password Baru" error={fieldErrors.password_baru?.[0]}>
        <Input id="password_baru" type="password" autoComplete="new-password" value={values.password_baru} onChange={set('password_baru')} required />
      </FormField>
      <FormField id="konfirmasi" label="Konfirmasi Password Baru" error={fieldErrors.konfirmasi?.[0]}>
        <Input id="konfirmasi" type="password" autoComplete="new-password" value={values.konfirmasi} onChange={set('konfirmasi')} required />
      </FormField>
      <Button type="submit" variant="outline" loading={isSubmitting}>Ubah Password</Button>
    </form>
  );
}
