import { addDays, format, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { mapError } from '@/lib/errors';
import { PAYMENT_STATUS_LABELS, type BookingStatus } from '@/lib/constants';

export const REPORT_ROW_CAP = 5000;

export interface ReportRow {
  id: number;
  kode_booking: string;
  created_at: string;
  nama_tamu: string;
  room_type_name: string;
  room_number: string;
  check_in: string;
  check_out: string;
  nights: number;
  total_harga: number;
  payment_label: string;
  payment_is_paid: boolean;
  status: BookingStatus;
}

export interface ReportSummary {
  total_booking: number;
  total_pendapatan: number;
  okupansi_persen: number;
  total_dibatalkan: number;
}

export interface ReportData {
  from: string;
  to: string;
  status: string;
  rows: ReportRow[];
  summary: ReportSummary;
  totalPaid: number;
  truncated: boolean;
}

interface RawPayment {
  transaction_status: string;
  is_paid: boolean;
  created_at: string;
}

interface RawBooking {
  id: number;
  kode_booking: string;
  created_at: string;
  nama_tamu: string;
  check_in: string;
  check_out: string;
  total_harga: number;
  status: BookingStatus;
  rooms: { nomor_kamar: string; room_types: { nama: string } } | null;
  payments: RawPayment[];
}

function nights(checkIn: string, checkOut: string): number {
  return Math.max(1, Math.round((parseISO(checkOut).getTime() - parseISO(checkIn).getTime()) / 86400000));
}

export async function getReportData(
  from: string,
  to: string,
  status?: string
): Promise<ReportData | { error: string }> {
  const supabase = await createClient();

  let query = supabase
    .from('bookings')
    .select(
      'id, kode_booking, created_at, nama_tamu, check_in, check_out, total_harga, status, rooms ( nomor_kamar, room_types ( nama ) ), payments ( transaction_status, is_paid, created_at )'
    )
    .gte('created_at', `${from}T00:00:00+07:00`)
    .lt('created_at', `${format(addDays(parseISO(to), 1), 'yyyy-MM-dd')}T00:00:00+07:00`)
    .order('created_at', { ascending: true })
    .limit(REPORT_ROW_CAP + 1);

  if (status) query = query.eq('status', status as BookingStatus);

  const [bookingsRes, summaryRes] = await Promise.all([
    query,
    callRpc<ReportSummary[]>(supabase, 'report_summary', { p_from: from, p_to: to }),
  ]);

  if (bookingsRes.error) return { error: mapError(bookingsRes.error).message };
  if (summaryRes.error) return { error: mapError(summaryRes.error).message };

  const raw = (bookingsRes.data ?? []) as unknown as RawBooking[];
  const truncated = raw.length > REPORT_ROW_CAP;

  const rows: ReportRow[] = raw.slice(0, REPORT_ROW_CAP).map((b) => {
    const latest = [...(b.payments ?? [])].sort((x, y) => (x.created_at < y.created_at ? 1 : -1))[0];
    return {
      id: b.id,
      kode_booking: b.kode_booking,
      created_at: b.created_at,
      nama_tamu: b.nama_tamu,
      room_type_name: b.rooms?.room_types?.nama ?? '-',
      room_number: b.rooms?.nomor_kamar ?? '-',
      check_in: b.check_in,
      check_out: b.check_out,
      nights: nights(b.check_in, b.check_out),
      total_harga: b.total_harga,
      payment_label: latest ? PAYMENT_STATUS_LABELS[latest.transaction_status] ?? latest.transaction_status : '-',
      payment_is_paid: latest?.is_paid ?? false,
      status: b.status,
    };
  });

  const totalPaid = rows.reduce((sum, r) => (r.payment_is_paid ? sum + r.total_harga : sum), 0);

  const summary = summaryRes.data?.[0] ?? {
    total_booking: 0,
    total_pendapatan: 0,
    okupansi_persen: 0,
    total_dibatalkan: 0,
  };

  return { from, to, status: status ?? '', rows, summary, totalPaid, truncated };
}
