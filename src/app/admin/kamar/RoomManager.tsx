'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusDot } from '@/components/ui/status-dot';
import { createRoom, updateRoom, deleteRoom } from '@/lib/actions/admin-rooms';
import { ROOM_STATUS_LABELS, type RoomStatus } from '@/lib/constants';
import { toast } from 'sonner';

export interface RoomRow {
  id: number;
  nomor_kamar: string;
  lantai: number | null;
  status: RoomStatus;
  room_type_id: number;
  room_type_name: string;
}

interface RoomTypeOption {
  id: number;
  nama: string;
}

export function RoomManager({
  rows,
  roomTypes,
  busyRoomIds,
}: {
  rows: RoomRow[];
  roomTypes: RoomTypeOption[];
  busyRoomIds: number[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState<RoomRow | 'new' | null>(null);
  const [deleting, setDeleting] = useState<RoomRow | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = rows.filter((r) => {
    if (search && !r.nomor_kamar.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (typeFilter && String(r.room_type_id) !== typeFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    const res = await deleteRoom(deleting.id);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.message);
      setDeleting(null);
      return;
    }
    toast.success('Kamar dihapus');
    setDeleting(null);
    router.refresh();
  };

  const deleteBusy = deleting ? busyRoomIds.includes(deleting.id) : false;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 flex items-end justify-between gap-4 border-b border-gold/25 pb-3">
        <div>
          <span className="mb-1 block text-[10px] uppercase tracking-[0.24em] text-gold">INVENTARIS KAMAR</span>
          <h1 className="font-serif text-3xl text-ivory">Kamar</h1>
        </div>
        <Button size="sm" onClick={() => setEditing('new')} disabled={roomTypes.length === 0}>
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Tambah Kamar
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 border-b border-gold/20 pb-3 md:flex-row md:items-center">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nomor kamar..." className="md:max-w-xs" />
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="md:max-w-[180px]">
          <option value="" className="bg-emerald-900">Semua Tipe</option>
          {roomTypes.map((t) => (
            <option key={t.id} value={t.id} className="bg-emerald-900">{t.nama}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="md:max-w-[180px]">
          <option value="" className="bg-emerald-900">Semua Status</option>
          <option value="tersedia" className="bg-emerald-900">Tersedia</option>
          <option value="perawatan" className="bg-emerald-900">Perawatan</option>
        </Select>
        <span className="text-[11px] text-muted-ivory">{filtered.length} dari {rows.length} kamar</span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-10">
          <EmptyState
            title={search || typeFilter || statusFilter ? 'Hasil pencarian kosong' : 'Belum ada kamar'}
            description={search || typeFilter || statusFilter ? 'Coba ubah filter.' : 'Tambahkan kamar terlebih dahulu.'}
          />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gold/30">
                {['NOMOR KAMAR', 'TIPE', 'LANTAI', 'STATUS', 'AKSI'].map((h, i) => (
                  <th key={h} className={`px-2 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-gold ${i === 4 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15 text-[13px]">
              {filtered.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-gold/5">
                  <td className="px-2 py-3.5 text-ivory">{r.nomor_kamar}</td>
                  <td className="px-2 py-3.5 text-muted-ivory">{r.room_type_name}</td>
                  <td className="px-2 py-3.5 text-muted-ivory">{r.lantai ?? '-'}</td>
                  <td className="px-2 py-3.5">
                    <StatusDot label={ROOM_STATUS_LABELS[r.status]} color={r.status === 'tersedia' ? 'success' : 'danger'} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setEditing(r)} className="text-[11px] uppercase tracking-widest text-gold hover:text-ivory">
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeleting(r)} className="text-[11px] uppercase tracking-widest text-danger hover:text-ivory">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' || editing === null ? 'Tambah Kamar' : 'Edit Kamar'}
      >
        {editing !== null && (
          <RoomForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? undefined : editing}
            roomTypes={roomTypes}
            isBusy={editing !== 'new' && busyRoomIds.includes(editing.id)}
            onDone={() => setEditing(null)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Hapus Kamar"
        message={
          busy
            ? 'Menghapus...'
            : deleteBusy
              ? `Kamar ${deleting?.nomor_kamar} sedang terisi booking aktif. Hapus tetap dilakukan? Booking terkait akan diblokir oleh sistem.`
              : `Hapus kamar ${deleting?.nomor_kamar}? Tindakan ini tidak dapat dibatalkan.`
        }
        danger
      />
    </div>
  );
}

function RoomForm({
  initial,
  roomTypes,
  isBusy,
  onDone,
}: {
  initial?: RoomRow;
  roomTypes: RoomTypeOption[];
  isBusy: boolean;
  onDone: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<RoomStatus>(initial?.status ?? 'tersedia');

  const handleSubmit = async (fd: FormData) => {
    setBusy(true);
    setErrors({});
    const input = {
      nomor_kamar: String(fd.get('nomor_kamar') ?? ''),
      room_type_id: Number(fd.get('room_type_id')),
      lantai: fd.get('lantai') ? Number(fd.get('lantai')) : undefined,
      status: fd.get('status') as RoomStatus,
    };
    const res = initial ? await updateRoom(initial.id, input) : await createRoom(input);
    setBusy(false);
    if (!res.ok) {
      setErrors((res.fieldErrors ?? {}) as Record<string, string[]>);
      toast.error(res.message);
      return;
    }
    toast.success(initial ? 'Kamar diperbarui' : 'Kamar ditambahkan');
    router.refresh();
    onDone();
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <FormField id="nomor_kamar" label="Nomor Kamar" error={errors.nomor_kamar?.[0]}>
        <Input id="nomor_kamar" name="nomor_kamar" defaultValue={initial?.nomor_kamar} required maxLength={10} />
      </FormField>

      <FormField id="room_type_id" label="Tipe Kamar" error={errors.room_type_id?.[0]}>
        <Select id="room_type_id" name="room_type_id" defaultValue={initial?.room_type_id ?? roomTypes[0]?.id} required>
          {roomTypes.map((t) => (
            <option key={t.id} value={t.id} className="bg-emerald-900">{t.nama}</option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="lantai" label="Lantai" error={errors.lantai?.[0]}>
          <Input id="lantai" name="lantai" type="number" min={0} max={50} defaultValue={initial?.lantai ?? undefined} />
        </FormField>
        <FormField id="status" label="Status" error={errors.status?.[0]}>
          <Select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as RoomStatus)}>
            <option value="tersedia" className="bg-emerald-900">Tersedia</option>
            <option value="perawatan" className="bg-emerald-900">Perawatan</option>
          </Select>
        </FormField>
      </div>

      {status === 'perawatan' && isBusy && (
        <div className="flex items-start gap-2 border border-danger/50 p-3 text-[12px] text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>Kamar ini sedang terisi booking aktif. Menandai sebagai perawatan tidak membatalkan booking yang berjalan.</span>
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-gold/25 pt-5">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" size="sm" loading={busy}>
          {initial ? 'Simpan Perubahan' : 'Tambah Kamar'}
        </Button>
      </div>
    </form>
  );
}
