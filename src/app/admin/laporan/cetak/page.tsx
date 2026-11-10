import { formatInTimeZone } from 'date-fns-tz';
import { connection } from 'next/server';
import { HOTEL, TIMEZONE, BOOKING_STATUS_LABELS } from '@/lib/constants';
import { reportFilterSchema } from '@/lib/validators';
import { getReportData } from '@/lib/reports/report-data';
import { formatRupiah, formatDate, formatDateTime } from '@/lib/format';
import { PrintButton } from '@/components/features/print-button';
import styles from './cetak.module.css';

export const metadata = {
  title: 'Cetak Laporan | The Hotels',
};

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}

export default async function ReportPrintPage({ searchParams }: PageProps) {
  await connection();
  const sp = await searchParams;
  const today = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
  const firstDay = `${today.slice(0, 7)}-01`;

  const parsed = reportFilterSchema.safeParse({
    from: sp.from ?? firstDay,
    to: sp.to ?? today,
    status: sp.status || undefined,
  });
  const { from, to, status } = parsed.success ? parsed.data : { from: firstDay, to: today, status: undefined };

  const result = await getReportData(from, to, status);
  if ('error' in result) {
    return <main className="p-8 text-black">{result.error}</main>;
  }

  return (
    <main className="bg-white p-8 text-black print:p-0">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton label="Cetak" />
      </div>

      <header className="border-b border-black pb-3 text-center">
        <h1 className="font-serif text-2xl tracking-[0.2em]">{HOTEL.name.toUpperCase()}</h1>
        <p className="mt-1 text-[11px]">{HOTEL.address} · {HOTEL.phone}</p>
        <h2 className="mt-3 text-lg font-semibold tracking-widest">LAPORAN BOOKING</h2>
        <p className="text-[11px]">
          Periode: {formatDate(from)} - {formatDate(to)}
          {status ? ` · Status: ${BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS]}` : ''}
        </p>
        <p className="text-[10px] text-gray-600">Dicetak: {formatDateTime(new Date())}</p>
      </header>

      <section className="my-3 flex flex-wrap justify-between gap-2 text-[11px]">
        <span>Total Booking: <strong>{result.summary.total_booking}</strong></span>
        <span>Total Pendapatan: <strong>{formatRupiah(result.summary.total_pendapatan)}</strong></span>
        <span>Tingkat Okupansi: <strong>{result.summary.okupansi_persen}%</strong></span>
        <span>Booking Dibatalkan: <strong>{result.summary.total_dibatalkan}</strong></span>
      </section>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Kode</th>
            <th>Tamu</th>
            <th>Kamar</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th className={styles.num}>Malam</th>
            <th className={styles.num}>Total</th>
            <th>Pembayaran</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((r) => (
            <tr key={r.id}>
              <td>{formatDate(r.created_at)}</td>
              <td>{r.kode_booking}</td>
              <td>{r.nama_tamu}</td>
              <td>{r.room_type_name} · {r.room_number}</td>
              <td>{formatDate(r.check_in)}</td>
              <td>{formatDate(r.check_out)}</td>
              <td className={styles.num}>{r.nights}</td>
              <td className={styles.num}>{formatRupiah(r.total_harga)}</td>
              <td>{r.payment_label}</td>
              <td>{BOOKING_STATUS_LABELS[r.status]}</td>
            </tr>
          ))}
          {result.rows.length === 0 && (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center' }}>Tidak ada data pada periode ini.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className={styles.totalRow}>
            <td colSpan={7} className={styles.num}>Total Dibayar</td>
            <td className={styles.num}>{formatRupiah(result.totalPaid)}</td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>

      <div className="mt-10 flex justify-end">
        <div className="text-center text-[11px]">
          <p>Surakarta, {formatDate(new Date())}</p>
          <p className="mt-2">Admin,</p>
          <div className="mt-12 border-t border-black pt-1">( ................................ )</div>
        </div>
      </div>
    </main>
  );
}
