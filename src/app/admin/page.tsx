import Link from 'next/link';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { AdminShell } from '@/components/layout/admin-shell';
import { RevenueChart, type RevenuePoint } from '@/components/features/revenue-chart';
import { AdminOccupancy, type OccupancyItem } from '@/components/features/admin-occupancy';
import { StatusDot } from '@/components/ui/status-dot';
import { formatRupiah, formatDate } from '@/lib/format';
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/lib/constants';

export const metadata = {
  title: 'Dashboard Admin | The Hotels',
};

interface DashboardStats {
  booking_hari_ini: number;
  pendapatan_bulan_ini: number;
  okupansi_persen: number;
  menunggu_pembayaran: number;
}

interface RecentBooking {
  kode_booking: string;
  nama_tamu: string;
  status: BookingStatus;
  check_in: string;
  rooms: { nomor_kamar: string; room_types: { nama: string } } | null;
}

const DOT_COLOR: Record<BookingStatus, 'gold' | 'success' | 'info' | 'muted' | 'danger'> = {
  pending: 'gold',
  dikonfirmasi: 'success',
  checked_in: 'info',
  selesai: 'muted',
  dibatalkan: 'danger',
};

interface PageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  await connection();
  const sp = await searchParams;
  const days = sp.days === '30' ? 30 : 7;
  const supabase = await createClient();

  const [statsRes, seriesRes, occRes, recentRes] = await Promise.all([
    callRpc<DashboardStats[]>(supabase, 'admin_dashboard_stats', {}),
    callRpc<RevenuePoint[]>(supabase, 'admin_revenue_series', { p_days: days }),
    callRpc<OccupancyItem[]>(supabase, 'admin_room_type_occupancy_today', {}),
    supabase
      .from('bookings')
      .select('kode_booking, nama_tamu, status, check_in, rooms ( nomor_kamar, room_types ( nama ) )')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const stats = statsRes.data?.[0] ?? {
    booking_hari_ini: 0,
    pendapatan_bulan_ini: 0,
    okupansi_persen: 0,
    menunggu_pembayaran: 0,
  };
  const series = seriesRes.data ?? [];
  const occupancy = occRes.data ?? [];
  const recent = (recentRes.data ?? []) as unknown as RecentBooking[];

  return (
    <AdminShell title="Dashboard">
      <div className="mx-auto max-w-7xl">
        <header className="pb-7">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.24em] text-gold">RINGKASAN EKSEKUTIF</span>
          </div>
          <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-baseline">
            <h1 className="font-serif text-3xl tracking-tight text-ivory">Selamat Datang, Admin</h1>
            <p className="text-[14px] italic text-muted-ivory">Tinjauan performa reservasi dan okupansi per hari ini.</p>
          </div>
        </header>

        <section className="grid grid-cols-1 divide-y divide-gold/25 border-y border-gold/25 py-7 md:grid-cols-2 md:divide-y-0 lg:grid-cols-4 lg:divide-x">
          <Stat value={String(stats.booking_hari_ini)} label="BOOKING HARI INI" sub="Terdaftar hari ini" className="py-4 lg:py-2 lg:pr-8" />
          <Stat value={formatRupiah(stats.pendapatan_bulan_ini)} label="PENDAPATAN BULAN INI" sub="Dari pembayaran lunas" className="py-4 lg:py-2 lg:px-8" compact />
          <Stat value={`${stats.okupansi_persen}%`} label="OKUPANSI" sub="Kamar terisi hari ini" className="py-4 lg:py-2 lg:px-8" />
          <Stat value={String(stats.menunggu_pembayaran)} label="MENUNGGU PEMBAYARAN" sub="Belum dibayar" gold className="py-4 lg:py-2 lg:pl-8" />
        </section>

        <section className="py-12">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.22em] text-gold">PENDAPATAN</span>
                <span className="text-gold/40">/</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted-ivory">FINANSIAL</span>
              </div>
              <h2 className="font-serif text-2xl text-ivory">Tren Pendapatan {days} Hari Terakhir</h2>
            </div>
            <div className="flex gap-4 self-start sm:self-end">
              {[7, 30].map((d) => (
                <Link
                  key={d}
                  href={`/admin?days=${d}`}
                  className={`border-b pb-1 text-[10px] uppercase tracking-[0.2em] ${days === d ? 'border-gold text-gold' : 'border-transparent text-muted-ivory hover:text-ivory'}`}
                >
                  {d} Hari
                </Link>
              ))}
            </div>
          </div>
          <RevenueChart data={series} />
        </section>

        <section className="border-t border-gold/25 pt-12">
          <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-7 lg:pr-6">
              <div className="mb-7 flex items-baseline justify-between border-b border-gold/25 pb-3">
                <div>
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.24em] text-gold">LOG OPERASIONAL</span>
                  <h2 className="font-serif text-2xl text-ivory">Booking Terbaru</h2>
                </div>
                <Link href="/admin/booking" className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-ivory">
                  Lihat Semua →
                </Link>
              </div>

              {recent.length === 0 ? (
                <p className="py-6 text-sm text-muted-ivory">Belum ada booking.</p>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[540px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-gold/30">
                        {['KODE', 'TAMU', 'KAMAR', 'CHECK-IN', 'STATUS'].map((h, i) => (
                          <th key={h} className={`py-3 px-2 text-[10px] font-normal uppercase tracking-[0.2em] text-gold ${i === 4 ? 'text-right' : ''}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/15 text-[13px]">
                      {recent.map((b) => (
                        <tr key={b.kode_booking} className="transition-colors hover:bg-gold/5">
                          <td className="whitespace-nowrap px-2 py-3.5 tracking-wider text-muted-ivory">{b.kode_booking}</td>
                          <td className="px-2 py-3.5 text-ivory">{b.nama_tamu}</td>
                          <td className="px-2 py-3.5 text-muted-ivory">{b.rooms?.room_types?.nama ?? '-'}</td>
                          <td className="whitespace-nowrap px-2 py-3.5 text-muted-ivory">{formatDate(b.check_in)}</td>
                          <td className="whitespace-nowrap px-2 py-3.5 text-right">
                            <StatusDot label={BOOKING_STATUS_LABELS[b.status]} color={DOT_COLOR[b.status]} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 lg:border-l lg:border-gold/25 lg:pl-12">
              <AdminOccupancy items={occupancy} />
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function Stat({
  value,
  label,
  sub,
  gold,
  compact,
  className = '',
}: {
  value: string;
  label: string;
  sub: string;
  gold?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col justify-between ${className}`}>
      <div className={`${compact ? 'font-serif text-[28px] leading-none whitespace-nowrap' : 'font-serif text-5xl leading-none'} ${gold ? 'text-gold' : 'text-ivory'}`}>
        {value}
      </div>
      <div className="mt-4">
        <span className="block text-[10px] uppercase tracking-[0.22em] text-gold">{label}</span>
        <span className="mt-1 block text-[12px] text-muted-ivory">{sub}</span>
      </div>
    </div>
  );
}
