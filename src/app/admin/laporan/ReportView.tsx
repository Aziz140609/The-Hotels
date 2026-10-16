'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusDot } from '@/components/ui/status-dot';
import { Pagination } from '@/components/ui/table';
import { formatRupiah, formatDate } from '@/lib/format';
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/lib/constants';
import type { ReportData } from '@/lib/reports/report-data';
import { toast } from 'sonner';

const DOT_COLOR: Record<BookingStatus, 'gold' | 'success' | 'info' | 'muted' | 'danger'> = {
  pending: 'gold',
  dikonfirmasi: 'success',
  checked_in: 'info',
  selesai: 'muted',
  dibatalkan: 'danger',
};

const SCREEN_PAGE_SIZE = 10;

export function ReportView({ data }: { data: ReportData }) {
  const router = useRouter();
  const [from, setFrom] = useState(data.from);
  const [to, setTo] = useState(data.to);
  const [status, setStatus] = useState(data.status);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);

  const query = new URLSearchParams({ from: data.from, to: data.to });
  if (data.status) query.set('status', data.status);
  const queryString = query.toString();

  const totalPages = Math.max(1, Math.ceil(data.rows.length / SCREEN_PAGE_SIZE));
  const pageRows = data.rows.slice((page - 1) * SCREEN_PAGE_SIZE, page * SCREEN_PAGE_SIZE);

  const apply = () => {
    const params = new URLSearchParams({ from, to });
    if (status) params.set('status', status);
    setPage(1);
    router.push(`/admin/laporan?${params.toString()}`);
  };

  const exportPdf = async () => {
    setBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const emerald: [number, number, number] = [11, 43, 38];

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('THE HOTELS', 148, 15, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Laporan Booking', 148, 22, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`Periode: ${formatDate(data.from)} - ${formatDate(data.to)}`, 148, 27, { align: 'center' });
      doc.text(
        `Total Booking: ${data.summary.total_booking}   Total Pendapatan: ${formatRupiah(data.summary.total_pendapatan)}   Okupansi: ${data.summary.okupansi_persen}%   Dibatalkan: ${data.summary.total_dibatalkan}`,
        148,
        32,
        { align: 'center' }
      );

      const body = data.rows.map((r) => [
        formatDate(r.created_at),
        r.kode_booking,
        r.nama_tamu,
        `${r.room_type_name} ${r.room_number}`,
        formatDate(r.check_in),
        formatDate(r.check_out),
        String(r.nights),
        formatRupiah(r.total_harga),
        r.payment_label,
        BOOKING_STATUS_LABELS[r.status],
      ]);

      autoTable(doc, {
        startY: 38,
        head: [['Tanggal', 'Kode', 'Tamu', 'Kamar', 'Check-in', 'Check-out', 'Malam', 'Total', 'Pembayaran', 'Status']],
        body,
        foot: [['', '', '', '', '', '', '', formatRupiah(data.totalPaid), 'Total Dibayar', '']],
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.5, textColor: [30, 30, 30], lineColor: [200, 200, 200], lineWidth: 0.1 },
        headStyles: { fillColor: emerald, textColor: [245, 240, 230], fontStyle: 'bold' },
        footStyles: { fillColor: [245, 240, 230], textColor: emerald, fontStyle: 'bold' },
        columnStyles: {
          7: { halign: 'right' },
          6: { halign: 'right' },
        },
        didDrawPage: () => {
          const pageCount = doc.getNumberOfPages();
          const current = doc.getCurrentPageInfo().pageNumber;
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text(`Halaman ${current} dari ${pageCount}`, 148, 200, { align: 'center' });
        },
      });

      doc.save(`laporan-the-hotels_${data.from}_${data.to}.pdf`);
      toast.success('PDF berhasil dibuat');
    } catch {
      toast.error('Gagal membuat PDF.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 border-b border-gold/25 pb-3">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.24em] text-gold">PELAPORAN</span>
        <h1 className="font-serif text-3xl text-ivory">Laporan Booking</h1>
      </div>

      <div className="mb-6 flex flex-col gap-3 border-b border-gold/20 pb-4 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-[10px] uppercase tracking-widest text-gold">Dari</label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-[10px] uppercase tracking-widest text-gold">Sampai</label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-[10px] uppercase tracking-widest text-gold">Status</label>
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="min-w-[160px]">
            <option value="" className="bg-emerald-900">Semua Status</option>
            {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((s) => (
              <option key={s} value={s} className="bg-emerald-900">{BOOKING_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </div>
        <Button size="sm" onClick={apply}>Terapkan</Button>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/admin/laporan/cetak?${queryString}`, '_blank')}
          >
            Cetak
          </Button>
          <Button variant="outline" size="sm" loading={busy} onClick={exportPdf}>
            Ekspor PDF
          </Button>
          <a
            href={`/api/admin/laporan/export?format=xlsx&${queryString}`}
            className="inline-flex items-center justify-center gap-2 border border-gold/70 bg-transparent px-5 py-2 font-sans text-[11px] font-medium uppercase tracking-label text-gold transition-colors duration-300 hover:bg-gold hover:text-emerald-900"
          >
            Ekspor Excel
          </a>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 divide-y divide-gold/25 border-y border-gold/25 py-7 md:grid-cols-2 md:divide-y-0 lg:grid-cols-4 lg:divide-x">
        <Summary label="TOTAL BOOKING" value={String(data.summary.total_booking)} className="py-4 lg:py-2 lg:pr-8" />
        <Summary label="TOTAL PENDAPATAN" value={formatRupiah(data.summary.total_pendapatan)} className="py-4 lg:py-2 lg:px-8" />
        <Summary label="TINGKAT OKUPANSI" value={`${data.summary.okupansi_persen}%`} className="py-4 lg:py-2 lg:px-8" />
        <Summary label="BOOKING DIBATALKAN" value={String(data.summary.total_dibatalkan)} className="py-4 lg:py-2 lg:pl-8" />
      </div>

      {data.truncated && (
        <p className="mb-4 border border-gold/40 p-3 text-[12px] text-gold">
          Data melebihi 5.000 baris. Persempit rentang tanggal untuk laporan lengkap.
        </p>
      )}

      {data.rows.length === 0 ? (
        <div className="py-10">
          <EmptyState title="Tidak ada data" description="Tidak ada booking pada periode/filter ini." />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gold/30">
                {['TANGGAL', 'KODE', 'TAMU', 'KAMAR', 'CHECK-IN', 'CHECK-OUT', 'MALAM', 'TOTAL', 'PEMBAYARAN', 'STATUS'].map((h, i) => (
                  <th key={h} className={`px-2 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-gold ${i >= 6 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15 text-[13px]">
              {pageRows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-gold/5">
                  <td className="whitespace-nowrap px-2 py-3 text-muted-ivory">{formatDate(r.created_at)}</td>
                  <td className="whitespace-nowrap px-2 py-3 tracking-wider text-muted-ivory">{r.kode_booking}</td>
                  <td className="px-2 py-3 text-ivory">{r.nama_tamu}</td>
                  <td className="px-2 py-3 text-muted-ivory">{r.room_type_name} · {r.room_number}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-muted-ivory">{formatDate(r.check_in)}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-muted-ivory">{formatDate(r.check_out)}</td>
                  <td className="px-2 py-3 text-right text-muted-ivory">{r.nights}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-right text-gold">{formatRupiah(r.total_harga)}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-right text-muted-ivory">{r.payment_label}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-right">
                    <StatusDot label={BOOKING_STATUS_LABELS[r.status]} color={DOT_COLOR[r.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gold/30">
                <td colSpan={7} className="px-2 py-3 text-right text-[11px] uppercase tracking-widest text-gold">Total Dibayar</td>
                <td className="whitespace-nowrap px-2 py-3 text-right font-serif text-[15px] text-ivory">{formatRupiah(data.totalPaid)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

function Summary({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex flex-col justify-between ${className}`}>
      <div className="font-serif text-3xl leading-none text-ivory">{value}</div>
      <span className="mt-4 block text-[10px] uppercase tracking-[0.22em] text-gold">{label}</span>
    </div>
  );
}
