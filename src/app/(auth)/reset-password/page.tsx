import Link from 'next/link';
import { SplitAuthLayout } from '@/components/layout/split-auth-layout';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

export default function ResetPasswordPage() {
  return (
    <SplitAuthLayout title="Reset Password" subtitle="Masukkan password baru untuk akun Anda.">
      <form className="space-y-6">
        <FormField id="password" label="Password Baru">
          <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" required />
        </FormField>
        <FormField id="konfirmasi" label="Konfirmasi Password Baru">
          <Input id="konfirmasi" name="konfirmasi" type="password" autoComplete="new-password" placeholder="Ulangi password baru" required />
        </FormField>
        <Button type="submit" className="w-full py-4">Simpan Password Baru</Button>
        <p className="text-center text-[13px] text-muted-ivory">
          <Link href="/login" className="text-gold hover:text-ivory">Kembali ke Masuk</Link>
        </p>
      </form>
    </SplitAuthLayout>
  );
}
