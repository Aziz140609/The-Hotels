import Link from 'next/link';
import { SplitAuthLayout } from '@/components/layout/split-auth-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  return (
    <SplitAuthLayout title="Daftar Akun" subtitle="Buat akun untuk mulai reservasi kamar.">
      <form className="space-y-6">
        <FormField id="nama" label="Nama Lengkap">
          <Input id="nama" name="nama" autoComplete="name" placeholder="Nama lengkap Anda" required />
        </FormField>
        <FormField id="email" label="Email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="email@anda.com" required />
        </FormField>
        <FormField id="phone" label="Nomor HP">
          <Input id="phone" name="no_hp" type="tel" autoComplete="tel" placeholder="081234567890" />
        </FormField>
        <FormField id="password" label="Password">
          <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" required />
        </FormField>
        <FormField id="konfirmasi" label="Konfirmasi Password">
          <Input id="konfirmasi" name="konfirmasi" type="password" autoComplete="new-password" placeholder="Ulangi password" required />
        </FormField>
        <Checkbox id="setuju" label="Saya menyetujui syarat dan ketentuan yang berlaku" />
        <Button type="submit" className="w-full py-4">Daftar</Button>
        <p className="text-center text-[13px] text-muted-ivory">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-gold hover:text-ivory">Masuk</Link>
        </p>
      </form>
    </SplitAuthLayout>
  );
}
