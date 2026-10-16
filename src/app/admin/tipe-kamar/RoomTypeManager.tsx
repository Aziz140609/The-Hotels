'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/ui/form-field';
import { EmptyState } from '@/components/ui/empty-state';
import { createRoomType, updateRoomType, deleteRoomType } from '@/lib/actions/admin-room-types';
import { formatRupiah } from '@/lib/format';
import { toast } from 'sonner';

export interface RoomTypeRow {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga_per_malam: number;
  kapasitas: number;
  fasilitas: string[];
  foto_url: string | null;
}

export function RoomTypeManager({ rows }: { rows: RoomTypeRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<RoomTypeRow | 'new' | null>(null);
  const [deleting, setDeleting] = useState<RoomTypeRow | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = rows.filter((r) => r.nama.toLowerCase().includes(search.trim().toLowerCase()));

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    const res = await deleteRoomType(deleting.id);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.message);
      setDeleting(null);
      return;
    }
    toast.success('Tipe kamar dihapus');
    setDeleting(null);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 flex items-end justify-between gap-4 border-b border-gold/25 pb-3">
        <div>
          <span className="mb-1 block text-[10px] uppercase tracking-[0.24em] text-gold">KATALOG TIPE KAMAR</span>
          <h1 className="font-serif text-3xl text-ivory">Tipe Kamar</h1>
        </div>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Tambah Tipe
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-3 border-b border-gold/20 pb-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari tipe kamar..."
          className="max-w-xs"
        />
        <span className="text-[11px] text-muted-ivory">{filtered.length} dari {rows.length} tipe</span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-10">
          <EmptyState
            title={search ? 'Hasil pencarian kosong' : 'Belum ada tipe kamar'}
            description={search ? 'Coba kata kunci lain.' : 'Tambahkan tipe kamar pertama Anda.'}
          />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gold/30">
                {['FOTO', 'NAMA TIPE', 'HARGA / MALAM', 'KAPASITAS', 'FASILITAS UTAMA', 'AKSI'].map((h, i) => (
                  <th key={h} className={`px-2 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-gold ${i === 5 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15 text-[13px]">
              {filtered.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-gold/5">
                  <td className="px-2 py-3.5">
                    <div className="relative h-12 w-16 overflow-hidden bg-emerald-950">
                      {r.foto_url ? (
                        <Image src={r.foto_url} alt={r.nama} fill sizes="64px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[9px] uppercase tracking-widest text-muted-ivory">n/a</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3.5">
                    <span className="block text-ivory">{r.nama}</span>
                    {r.deskripsi && <span className="mt-0.5 block max-w-xs truncate text-[11px] text-muted-ivory">{r.deskripsi}</span>}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-gold">{formatRupiah(r.harga_per_malam)}</td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-muted-ivory">{r.kapasitas} Orang</td>
                  <td className="px-2 py-3.5 text-muted-ivory">
                    <div className="flex max-w-[220px] flex-wrap gap-1">
                      {r.fasilitas.slice(0, 4).map((f) => (
                        <span key={f} className="border border-gold/25 px-1.5 py-0.5 text-[10px]">{f}</span>
                      ))}
                      {r.fasilitas.length > 4 && <span className="text-[10px] text-gold">+{r.fasilitas.length - 4}</span>}
                    </div>
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
        title={editing === 'new' || editing === null ? 'Tambah Tipe Kamar' : 'Edit Tipe Kamar'}
      >
        {editing !== null && (
          <RoomTypeForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Hapus Tipe Kamar"
        message={
          busy
            ? 'Menghapus...'
            : `Hapus tipe kamar "${deleting?.nama}"? Tindakan ini tidak dapat dibatalkan.`
        }
        danger
      />
    </div>
  );
}

function RoomTypeForm({ initial, onDone }: { initial?: RoomTypeRow; onDone: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [facilities, setFacilities] = useState<string[]>(initial?.fasilitas ?? []);
  const [facilityInput, setFacilityInput] = useState('');

  const addFacility = () => {
    const value = facilityInput.trim();
    if (!value || facilities.includes(value)) return;
    setFacilities([...facilities, value]);
    setFacilityInput('');
  };

  const handleSubmit = async (fd: FormData) => {
    setBusy(true);
    setErrors({});
    const res = initial ? await updateRoomType(initial.id, fd) : await createRoomType(fd);
    setBusy(false);
    if (!res.ok) {
      setErrors((res.fieldErrors ?? {}) as Record<string, string[]>);
      toast.error(res.message);
      return;
    }
    toast.success(initial ? 'Tipe kamar diperbarui' : 'Tipe kamar ditambahkan');
    router.refresh();
    onDone();
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <FormField id="nama" label="Nama Tipe Kamar" error={errors.nama?.[0]}>
        <Input id="nama" name="nama" defaultValue={initial?.nama} required maxLength={50} />
      </FormField>

      <FormField id="deskripsi" label="Deskripsi" error={errors.deskripsi?.[0]}>
        <Textarea id="deskripsi" name="deskripsi" rows={3} defaultValue={initial?.deskripsi ?? ''} maxLength={1000} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="harga_per_malam" label="Tarif / Malam (Rp)" error={errors.harga_per_malam?.[0]}>
          <Input id="harga_per_malam" name="harga_per_malam" type="number" min={50000} step={1000} defaultValue={initial?.harga_per_malam} required />
        </FormField>
        <FormField id="kapasitas" label="Kapasitas (orang)" error={errors.kapasitas?.[0]}>
          <Input id="kapasitas" name="kapasitas" type="number" min={1} max={10} defaultValue={initial?.kapasitas} required />
        </FormField>
      </div>

      <div>
        <Label className="mb-2">Fasilitas Kamar</Label>
        {facilities.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {facilities.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 border border-gold/40 px-2 py-1 text-[11px] text-ivory">
                {f}
                <button type="button" aria-label={`Hapus ${f}`} onClick={() => setFacilities(facilities.filter((x) => x !== f))} className="text-gold hover:text-danger">
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
                <input type="hidden" name="fasilitas" value={f} />
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={facilityInput}
            onChange={(e) => setFacilityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFacility();
              }
            }}
            placeholder="Tambah fasilitas lalu Enter"
            maxLength={30}
          />
          <Button type="button" variant="outline" size="sm" onClick={addFacility}>
            Tambah
          </Button>
        </div>
        {errors.fasilitas && <p className="mt-1 text-[12px] text-danger">{errors.fasilitas[0]}</p>}
      </div>

      <FormField id="foto" label="Foto (JPG/PNG/WEBP, maks 2MB)" error={errors.foto?.[0]}>
        <input
          id="foto"
          name="foto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 block w-full text-[13px] text-muted-ivory file:mr-3 file:border file:border-gold/50 file:bg-transparent file:px-3 file:py-1.5 file:text-[11px] file:uppercase file:tracking-widest file:text-gold"
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-gold/25 pt-5">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" size="sm" loading={busy}>
          {initial ? 'Simpan Perubahan' : 'Tambah Tipe'}
        </Button>
      </div>
    </form>
  );
}
