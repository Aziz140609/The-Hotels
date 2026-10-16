import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/layout/admin-shell';
import { RoomTypeManager, type RoomTypeRow } from './RoomTypeManager';

export const metadata = {
  title: 'Tipe Kamar | Admin The Hotels',
};

export default async function AdminRoomTypesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('room_types')
    .select('id, nama, deskripsi, harga_per_malam, kapasitas, fasilitas, foto_url')
    .order('harga_per_malam', { ascending: true });

  const rows = (data ?? []) as RoomTypeRow[];

  return (
    <AdminShell title="Tipe Kamar">
      <RoomTypeManager rows={rows} />
    </AdminShell>
  );
}
