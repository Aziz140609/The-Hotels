'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/table';
import { StatusDot } from '@/components/ui/status-dot';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { cancelBooking } from '@/lib/actions/bookings';
import { formatRupiah, formatDate } from '@/lib/format';
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/lib/constants';
import { toast } from 'sonner';

export interface BookingHistoryRow {
  id: number;
  kode_booking: string;
  check_in: string;
  check_out: string;
  jumlah_tamu: number;
  total_harga: number;
  status: BookingStatus;
  room_name: string;
}

interface BookingHistoryProps {
  bookings: BookingHistoryRow[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  status: string;
  cancellableIds: number[];
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Semua Status' },
  ...(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((s) => ({
    value: s,
    label: BOOKING_STATUS_LABELS[s],
  })),
];

const DOT_COLOR: Record<BookingStatus, 'gold' | 'success' | 'info' | 'muted' | 'danger'> = {
  pending: 'gold',
  dikonfirmasi: 'success',
  checked_in: 'info',
  selesai: 'muted',
  dibatalkan: 'danger',
};

export function BookingHistory({ bookings, total, page, pageSize, q, status, cancellableIds }: BookingHistoryProps) {
  const router = useRouter();
  const [search, setSearch] = useState(q);
  const [cancelTarget, setCancelTarget] = useState<BookingHistoryRow | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const applyFilters = (nextQ: string, nextStatus: string, nextPage = 1) => {
    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    if (nextStatus) params.set('status', nextStatus);
    if (nextPage > 1) params.set('page', String(nextPage));
    router.push(`/akun/booking${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    const result = await cancelBooking(cancelTarget.id);
    setIsCancelling(false);
    if (!result.ok) {
      toast.error(result.message);
      setCancelTarget(null);
      return;
    }
    toast.success('Booking dibatalkan');
    setCancelTarget(null);
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-gold/30 pb-4 md:flex-row md:items-center md:justify-between">
        <form
          onSubmit={(e) => { e.preventDefault(); applyFilters(search, status); }}
          className="flex gap-2"
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode booking..."
            className="w-full md:w-64"
          />
          <Button type="submit" variant="outline" size="sm">Cari</Button>
        </form>
        <select
          value={status}
          onChange={(e) => applyFilters(search, e.target.value)}
          className="cursor-pointer border border-gold/40 bg-emerald-800/60 px-3 py-2 text-[12px] text-ivory focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-emerald-900">{o.label}</option>
          ))}
        </select>
      </div>

      {bookings.length === 0 ? (
        <div className="py-10">
          <EmptyState
            title={q || status ? 'Hasil pencarian kosong' : 'Belum ada booking'}
            description={q || status ? 'Coba ubah kata kunci atau filter status.' : 'Anda belum memiliki pesanan. Mulai jelajahi kamar kami.'}
          />
        </div>
      ) : (
        <ul className="divide-y divide-gold/15">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-4 py-5 px-3 md:flex-row md:items-center md:justify-between transition-all duration-300 hover:bg-emerald-800/30 hover:pl-5 border-l-2 border-transparent hover:border-gold"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-lg text-ivory">{b.kode_booking}</span>
                  <StatusDot label={BOOKING_STATUS_LABELS[b.status]} color={DOT_COLOR[b.status]} />
                </div>
                <p className="text-[13px] text-muted-ivory">
                  {b.room_name} · {formatDate(b.check_in)} – {formatDate(b.check_out)} · {b.jumlah_tamu} tamu
                </p>
                <p className="font-serif text-gold">{formatRupiah(b.total_harga)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/booking/${b.id}/status`}>
                  <Button variant="ghost" size="sm">Detail</Button>
                </Link>
                {b.status === 'pending' && (
                  <Link href={`/booking/${b.id}`}>
                    <Button size="sm">Bayar</Button>
                  </Link>
                )}
                {cancellableIds.includes(b.id) && (
                  <Button variant="danger" size="sm" onClick={() => setCancelTarget(b)}>Batalkan</Button>
                )}
                {(b.status === 'dikonfirmasi' || b.status === 'checked_in' || b.status === 'selesai') && (
                  <Link href={`/booking/${b.id}/bukti`}>
                    <Button variant="outline" size="sm">Bukti</Button>
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => applyFilters(q, status, p)} />
        </div>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Batalkan Booking"
        message={
          isCancelling
            ? 'Membatalkan...'
            : `Yakin ingin membatalkan booking ${cancelTarget?.kode_booking}? Tindakan ini tidak dapat dibatalkan.`
        }
        danger
      />
    </div>
  );
}
