import { SplitAuthLayout } from '@/components/layout/split-auth-layout';
import { ResetForm } from './ResetForm';

export default function ResetPasswordPage() {
  return (
    <SplitAuthLayout title="Reset Password" subtitle="Masukkan password baru untuk akun Anda.">
      <ResetForm />
    </SplitAuthLayout>
  );
}
