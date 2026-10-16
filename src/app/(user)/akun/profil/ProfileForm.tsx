'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { updateProfile } from '@/lib/actions/auth';
import { toast } from 'sonner';

interface ProfileFormProps {
  email: string;
  initial: { nama_lengkap: string; no_hp: string };
}

export function ProfileForm({ email, initial }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [values, setValues] = useState(initial);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await updateProfile(values);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      toast.error(result.message);
      setIsSubmitting(false);
      return;
    }

    toast.success('Profil berhasil diperbarui');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField id="email" label="Email">
        <Input id="email" value={email} disabled className="opacity-60" />
      </FormField>
      <FormField id="nama_lengkap" label="Nama Lengkap" error={fieldErrors.nama_lengkap?.[0]}>
        <Input id="nama_lengkap" value={values.nama_lengkap} onChange={(e) => setValues((v) => ({ ...v, nama_lengkap: e.target.value }))} required />
      </FormField>
      <FormField id="no_hp" label="Nomor HP" error={fieldErrors.no_hp?.[0]}>
        <Input id="no_hp" type="tel" value={values.no_hp} onChange={(e) => setValues((v) => ({ ...v, no_hp: e.target.value }))} placeholder="081234567890" />
      </FormField>
      <Button type="submit" loading={isSubmitting}>Simpan Perubahan</Button>
    </form>
  );
}
