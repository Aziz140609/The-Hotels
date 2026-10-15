import Link from 'next/link';
import { SplitAuthLayout } from '@/components/layout/split-auth-layout';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  return (
    <SplitAuthLayout title="Selamat Datang Kembali" subtitle="Masuk untuk mengelola reservasi Anda.">
      <form className="space-y-6">
        <FormField id="email" label="Email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="email@anda.com" required />
        </FormField>
        <FormField id="password" label="Password">
          <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Masukkan password" required />
        </FormField>
        <div className="flex justify-end">
          <Link href="/lupa-password" className="text-[11px] uppercase tracking-wide text-gold hover:text-ivory">Lupa Password?</Link>
        </div>
        <Button type="submit" className="w-full py-4">Masuk</Button>
        <p className="text-center text-[13px] text-muted-ivory">
          Belum punya akun?{' '}
          <Link href="/register" className="text-gold hover:text-ivory">Daftar Sekarang</Link>
        </p>
      </form>
    </SplitAuthLayout>
  );
}
