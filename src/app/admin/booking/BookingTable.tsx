'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusDot } from '@/components/ui/status-dot';
import { Pagination } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { updateBookingStatus, updateBookingNote, deleteBooking } from '@/lib/actions/admin-bookings';
import { formatRupiah, formatDate } from '@/lib/format';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS, type BookingStatus } from '@/lib/constants';
import { toast } from 'sonner';

export interface AdminBookingRow {
  id: number;
  kode_booking: string;
  nama_tamu: string;
  email_tamu: string;
  no_hp_tamu: string;
  catatan: string | null;
  check_in: string;
  check_out: string;
  jumlah_tamu: number;
  total_harga: number;
  status: BookingStatus;
  room_number: string;
  room_type_name: string;
  created_at: string;
  payment_status: string | null;
  payment_is_paid: boolean;
  payment_type: string | null;
  order_id: string | null;
}

const DOT_COLOR: Record<BookingStatus, 'gold' | 'success' | 'info' | 'muted' | 'danger'> = {
  pending: 'gold',
  dikonfirmasi: 'success',
  checked_in: 'info',
  selesai: 'muted',
  dibatalkan: 'danger',
};

const NEXT_ACTIONS: Record<string, { label: string; status: BookingStatus; danger?: boolean }[]> = {
  dikonfirmasi: [
    { label: 'Check-in', status: 'checked_in' },
    { label: 'Batalkan', status: 'dibatalkan', danger: true },
  ],
  checked_in: [{ label: 'Selesaikan', status: 'selesai' }],
};

interface BookingFilters {
  q: string;
  status: string;
  from: string;
  to: string;
}

export function BookingTable({
  rows,
  total,
  page,
  pageSize,
  filters,
}: {
  rows: AdminBookingRow[];
  total: number;
  page: number;
  pageSize: number;
  filters: BookingFilters;
}) {
  const router = useRouter();
  const [local, setLocal] = useState(filters);
  const [selected, setSelected] = useState<AdminBookingRow | null>(null);

  const current = selected ? rows.find((r) => r.id === selected.id) ?? selected : null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const applyFilters = (next: BookingFilters, nextPage = 1) => {
    const params = new URLSearchParams();
    if (next.q) params.set('q', next.q);
    if (next.status) params.set('status', next.status);
    if (next.from) params.set('from', next.from);
    if (next.to) params.set('to', next.to);
    if (nextPage > 1) params.set('page', String(nextPage));
    router.push(`/admin/booking${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const refreshSelected = () => {
    setSelected(null);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 border-b border-gold/25 pb-3">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.24em] text-gold">LOG RESERVASI</span>
        <h1 className="font-serif text-3xl text-ivory">Manajemen Booking</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters(local);
        }}
        className="mb-6 grid grid-cols-1 gap-3 border-b border-gold/20 pb-4 md:grid-cols-5"
      >
        <Input value={local.q} onChange={(e) => setLocal({ ...local, q: e.target.value })} placeholder="Cari kode / nama tamu..." />
        <Select value={local.status} onChange={(e) => setLocal({ ...local, status: e.target.value })}>
          <option value="" className="bg-emerald-900">Semua Status</option>
          {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((s) => (
            <option key={s} value={s} className="bg-emerald-900">{BOOKING_STATUS_LABELS[s]}</option>
          ))}
        </Select>
        <Input type="date" value={local.from} onChange={(e) => setLocal({ ...local, from: e.target.value })} aria-label="Dari tanggal" />
        <Input type="date" value={local.to} onChange={(e) => setLocal({ ...local, to: e.target.value })} aria-label="Sampai tanggal" />
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1">Terapkan</Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const cleared = { q: '', status: '', from: '', to: '' };
              setLocal(cleared);
              applyFilters(cleared);
            }}
          >
            Reset
          </Button>
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="py-10">
          <EmptyState title="Belum ada booking" description="Belum ada reservasi yang cocok dengan filter." />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gold/30">
                {['KODE', 'TAMU', 'KAMAR', 'MENGINAP', 'TOTAL', 'PEMBAYARAN', 'STATUS', 'AKSI'].map((h, i) => (
                  <th key={h} className={`px-2 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-gold ${i === 7 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15 text-[13px]">
              {rows.map((b) => (
                <tr key={b.id} className="cursor-pointer transition-colors hover:bg-gold/5" onClick={() => setSelected(b)}>
                  <td className="whitespace-nowrap px-2 py-3.5 tracking-wider text-muted-ivory">{b.kode_booking}</td>
                  <td className="px-2 py-3.5 text-ivory">{b.nama_tamu}</td>
                  <td className="px-2 py-3.5 text-muted-ivory">{b.room_type_name} · {b.room_number}</td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-muted-ivory">{formatDate(b.check_in)} – {formatDate(b.check_out)}</td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-gold">{formatRupiah(b.total_harga)}</td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-muted-ivory">{b.payment_status ? PAYMENT_STATUS_LABELS[b.payment_status] ?? b.payment_status : '-'}</td>
                  <td className="whitespace-nowrap px-2 py-3.5">
                    <StatusDot label={BOOKING_STATUS_LABELS[b.status]} color={DOT_COLOR[b.status]} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-right">
                    <span className="text-[11px] uppercase tracking-widest text-gold">Detail</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => applyFilters(filters, p)} />
        </div>
      )}

      <Dialog open={selected !== null} onClose={refreshSelected} title="Detail Booking">
        {current && <BookingDetail booking={current} onDone={refreshSelected} />}
      </Dialog>
    </div>
  );
}

function BookingDetail({ booking, onDone }: { booking: AdminBookingRow; onDone: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(booking.catatan ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const actions = NEXT_ACTIONS[booking.status] ?? [];

  const changeStatus = async (status: BookingStatus) => {
    setBusy(true);
    const res = await updateBookingStatus({ bookingId: booking.id, status });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success('Status diperbarui');
    onDone();
  };

  const saveNote = async () => {
    setBusy(true);
    const res = await updateBookingNote({ bookingId: booking.id, catatan: note });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success('Catatan disimpan');
    router.refresh();
  };

  const handleDelete = async () => {
    setBusy(true);
    const res = await deleteBooking(booking.id);
    setBusy(false);
    setConfirmDelete(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success('Booking dihapus');
    onDone();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4">
        <span className="font-serif text-xl text-ivory">{booking.kode_booking}</span>
        <StatusDot label={BOOKING_STATUS_LABELS[booking.status]} color={DOT_COLOR[booking.status]} />
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Detail label="Nama Tamu" value={booking.nama_tamu} />
        <Detail label="Email" value={booking.email_tamu} />
        <Detail label="No. HP" value={booking.no_hp_tamu} />
        <Detail label="Jumlah Tamu" value={`${booking.jumlah_tamu} orang`} />
        <Detail label="Kamar" value={`${booking.room_type_name} · ${booking.room_number}`} />
        <Detail label="Total" value={formatRupiah(booking.total_harga)} />
        <Detail label="Check-in" value={formatDate(booking.check_in)} />
        <Detail label="Check-out" value={formatDate(booking.check_out)} />
        <Detail label="Dibuat" value={formatDate(booking.created_at)} />
        <Detail label="Pembayaran" value={booking.payment_status ? PAYMENT_STATUS_LABELS[booking.payment_status] ?? booking.payment_status : '-'} />
      </dl>

      {booking.order_id && (
        <p className="text-[11px] text-muted-ivory">Order ID: {booking.order_id}{booking.payment_type ? ` · ${booking.payment_type}` : ''}</p>
      )}

      <div>
        <label htmlFor="catatan" className="mb-1.5 block text-[11px] uppercase tracking-label text-gold">Catatan Admin</label>
        <Textarea id="catatan" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tambahkan catatan internal..." />
        <div className="mt-2 flex justify-end">
          <Button size="sm" variant="outline" onClick={saveNote} loading={busy && note !== (booking.catatan ?? '')}>
            Simpan Catatan
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-gold/25 pt-5">
        {booking.status === 'dibatalkan' && (
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            Hapus Booking
          </Button>
        )}
        {actions.map((a) => (
          <Button key={a.status} variant={a.danger ? 'danger' : 'primary'} size="sm" loading={busy} onClick={() => changeStatus(a.status)}>
            {a.label}
          </Button>
        ))}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Booking"
        message={`Hapus permanen booking ${booking.kode_booking}? Tindakan ini tidak dapat dibatalkan.`}
        danger
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-gold">{label}</dt>
      <dd className="mt-0.5 text-[13px] text-ivory">{value}</dd>
    </div>
  );
}
