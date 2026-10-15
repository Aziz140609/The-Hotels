import Link from 'next/link';
import { SplitAuthLayout } from '@/components/layout/split-auth-layout';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

export default function LupaPasswordPage() {
  return (
    <SplitAuthLayout title="Lupa Password" subtitle="Masukkan email Anda untuk menerima tautan reset password.">
      <form className="space-y-6">
        <FormField id="email" label="Email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="email@anda.com" required />
        </FormField>
        <Button type="submit" className="w-full py-4">Kirim Tautan Reset</Button>
        <p className="text-center text-[13px] text-muted-ivory">
          Ingat password?{' '}
          <Link href="/login" className="text-gold hover:text-ivory">Masuk</Link>
        </p>
      </form>
    </SplitAuthLayout>
  );
}
