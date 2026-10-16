import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './ProfileForm';
import { PasswordForm } from './PasswordForm';

export const metadata = {
  title: 'Profil Saya | The Hotels',
};

export default async function ProfilPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama_lengkap, no_hp')
    .eq('id', user.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-20">
      <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Akun</span>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-ivory">Profil Saya</h1>
      <div className="my-4 h-px w-16 bg-gold/40" />

      <section className="mt-10 border border-gold/30 bg-emerald-800/40 p-6 md:p-8">
        <h2 className="mb-6 font-serif text-2xl text-ivory">Data Pribadi</h2>
        <ProfileForm
          email={user.email ?? ''}
          initial={{
            nama_lengkap: profile?.nama_lengkap ?? '',
            no_hp: profile?.no_hp ?? '',
          }}
        />
      </section>

      <section className="mt-8 border border-gold/30 bg-emerald-800/40 p-6 md:p-8">
        <h2 className="mb-6 font-serif text-2xl text-ivory">Keamanan</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
