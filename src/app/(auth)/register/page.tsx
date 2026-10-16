import { SplitAuthLayout } from '@/components/layout/split-auth-layout';
import { RegisterForm } from './RegisterForm';

export default function RegisterPage() {
  return (
    <SplitAuthLayout title="Daftar Akun" subtitle="Buat akun untuk mulai reservasi kamar.">
      <RegisterForm />
    </SplitAuthLayout>
  );
}
