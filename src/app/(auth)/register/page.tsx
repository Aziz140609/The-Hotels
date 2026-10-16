import { SplitAuthLayout } from '@/components/layout/split-auth-layout';
import { RegisterForm } from './RegisterForm';

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <SplitAuthLayout title="Daftar Akun" subtitle="Buat akun untuk mulai reservasi kamar.">
      <RegisterForm next={next} />
    </SplitAuthLayout>
  );
}
