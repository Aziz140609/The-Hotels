import { SplitAuthLayout } from '@/components/layout/split-auth-layout';
import { LoginForm } from './LoginForm';

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <SplitAuthLayout title="Selamat Datang Kembali" subtitle="Masuk untuk mengelola reservasi Anda.">
      <LoginForm next={next} />
    </SplitAuthLayout>
  );
}
