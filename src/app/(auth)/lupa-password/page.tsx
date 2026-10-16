import { SplitAuthLayout } from '@/components/layout/split-auth-layout';
import { ForgotForm } from './ForgotForm';

export default function LupaPasswordPage() {
  return (
    <SplitAuthLayout title="Lupa Password" subtitle="Masukkan email Anda untuk menerima tautan reset password.">
      <ForgotForm />
    </SplitAuthLayout>
  );
}
