import { formatInTimeZone } from 'date-fns-tz';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/layout/admin-shell';
import { TIMEZONE, type RoomStatus } from '@/lib/constants';
import { RoomManager, type RoomRow } from './RoomManager';

export const metadata = {
  title: 'Kamar | Admin The Hotels',
};

interface RawRoom {
  id: number;
  nomor_kamar: string;
  lantai: number | null;
  status: RoomStatus;
  room_type_id: number;
  room_types: { nama: string } | null;
}

export default async function AdminRoomsPage() {
  const supabase = await createClient();
  const today = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');

  const [roomRes, typeRes, activeRes] = await Promise.all([
    supabase
      .from('rooms')
      .select('id, nomor_kamar, lantai, status, room_type_id, room_types ( nama )')
      .order('nomor_kamar', { ascending: true }),
    supabase.from('room_types').select('id, nama').order('nama', { ascending: true }),
    supabase
      .from('bookings')
      .select('room_id')
      .in('status', ['dikonfirmasi', 'checked_in'])
      .lte('check_in', today)
      .gt('check_out', today),
  ]);

  const rows: RoomRow[] = ((roomRes.data ?? []) as unknown as RawRoom[]).map((r) => ({
    id: r.id,
    nomor_kamar: r.nomor_kamar,
    lantai: r.lantai,
    status: r.status,
    room_type_id: r.room_type_id,
    room_type_name: r.room_types?.nama ?? '-',
  }));

  const roomTypes = (typeRes.data ?? []) as { id: number; nama: string }[];
  const busyRoomIds = [...new Set((activeRes.data ?? []).map((b) => b.room_id))];

  return (
    <AdminShell title="Kamar">
      <RoomManager rows={rows} roomTypes={roomTypes} busyRoomIds={busyRoomIds} />
    </AdminShell>
  );
}
