import { formatInTimeZone } from 'date-fns-tz';
import { connection } from 'next/server';
import { AdminShell } from '@/components/layout/admin-shell';
import { TIMEZONE } from '@/lib/constants';
import { reportFilterSchema } from '@/lib/validators';
import { getReportData } from '@/lib/reports/report-data';
import { ReportView } from './ReportView';

export const metadata = {
  title: 'Laporan | Admin The Hotels',
};

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}

export default async function AdminReportPage({ searchParams }: PageProps) {
  await connection();
  const sp = await searchParams;
  const today = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
  const firstDay = `${today.slice(0, 7)}-01`;

  const parsed = reportFilterSchema.safeParse({
    from: sp.from ?? firstDay,
    to: sp.to ?? today,
    status: sp.status || undefined,
  });

  const { from, to, status } = parsed.success
    ? parsed.data
    : { from: firstDay, to: today, status: undefined };

  const result = await getReportData(from, to, status);

  if ('error' in result) {
    return (
      <AdminShell title="Laporan">
        <p className="border border-danger/50 p-4 text-sm text-danger">{result.error}</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Laporan">
      <ReportView data={result} />
    </AdminShell>
  );
}
