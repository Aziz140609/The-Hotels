import { NextResponse, type NextRequest } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import { reportFilterSchema } from '@/lib/validators';
import { getReportData } from '@/lib/reports/report-data';
import { HOTEL, BOOKING_STATUS_LABELS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });

  const { data: profile } = (await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: { role: string } | null };
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const params = request.nextUrl.searchParams;
  const parsed = reportFilterSchema.safeParse({
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
    status: params.get('status') || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_PARAMS' }, { status: 400 });

  const { from, to, status } = parsed.data;
  const result = await getReportData(from, to, status);
  if ('error' in result) return NextResponse.json({ error: 'QUERY_FAILED' }, { status: 500 });

  const wb = new ExcelJS.Workbook();
  wb.creator = HOTEL.name;
  wb.created = new Date();

  const ws = wb.addWorksheet('Laporan');
  ws.columns = [
    { key: 'tanggal', width: 12 },
    { key: 'kode', width: 20 },
    { key: 'tamu', width: 24 },
    { key: 'kamar', width: 24 },
    { key: 'checkin', width: 12 },
    { key: 'checkout', width: 12 },
    { key: 'malam', width: 8 },
    { key: 'total', width: 16 },
    { key: 'paid', width: 16 },
    { key: 'pembayaran', width: 14 },
    { key: 'status', width: 18 },
  ];

  ws.mergeCells('A1:K1');
  ws.getCell('A1').value = HOTEL.name.toUpperCase();
  ws.getCell('A1').font = { bold: true, size: 14 };
  ws.getCell('A1').alignment = { horizontal: 'center' };

  ws.mergeCells('A2:K2');
  ws.getCell('A2').value = 'Laporan Booking';
  ws.getCell('A2').font = { bold: true };
  ws.getCell('A2').alignment = { horizontal: 'center' };

  ws.mergeCells('A3:K3');
  ws.getCell('A3').value = `Periode: ${from} s/d ${to}${status ? ` · Status: ${BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS]}` : ''}`;
  ws.getCell('A3').alignment = { horizontal: 'center' };

  const header = ws.getRow(5);
  header.values = ['Tanggal', 'Kode Booking', 'Tamu', 'Kamar', 'Check-in', 'Check-out', 'Malam', 'Total', 'Total Dibayar', 'Pembayaran', 'Status'];
  header.font = { bold: true, color: { argb: 'FFF5F0E6' } };
  header.alignment = { vertical: 'middle' };
  header.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B2B26' } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFC9A96E' } } };
  });
  ws.views = [{ state: 'frozen', ySplit: 5 }];
  ws.autoFilter = { from: 'A5', to: 'K5' };

  let rowIndex = 6;
  for (const r of result.rows) {
    const row = ws.getRow(rowIndex);
    row.getCell(1).value = new Date(r.created_at);
    row.getCell(1).numFmt = 'dd/mm/yyyy';
    row.getCell(2).value = r.kode_booking;
    row.getCell(3).value = r.nama_tamu;
    row.getCell(4).value = `${r.room_type_name} - ${r.room_number}`;
    row.getCell(5).value = new Date(r.check_in);
    row.getCell(5).numFmt = 'dd/mm/yyyy';
    row.getCell(6).value = new Date(r.check_out);
    row.getCell(6).numFmt = 'dd/mm/yyyy';
    row.getCell(7).value = r.nights;
    row.getCell(8).value = r.total_harga;
    row.getCell(8).numFmt = '"Rp"#,##0';
    row.getCell(9).value = r.payment_is_paid ? r.total_harga : 0;
    row.getCell(9).numFmt = '"Rp"#,##0';
    row.getCell(10).value = r.payment_label;
    row.getCell(11).value = BOOKING_STATUS_LABELS[r.status];
    rowIndex += 1;
  }

  const totalRow = ws.getRow(rowIndex);
  totalRow.getCell(8).value = 'TOTAL DIBAYAR';
  totalRow.getCell(8).font = { bold: true };
  totalRow.getCell(9).value = { formula: `SUM(I6:I${rowIndex - 1})` };
  totalRow.getCell(9).numFmt = '"Rp"#,##0';
  totalRow.getCell(9).font = { bold: true };

  const summary = wb.addWorksheet('Ringkasan');
  summary.columns = [
    { key: 'label', width: 26 },
    { key: 'value', width: 22 },
  ];
  summary.addRow(['Ringkasan Laporan', '']);
  summary.addRow(['Periode', `${from} s/d ${to}`]);
  summary.addRow(['Status Filter', status ? BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS] : 'Semua']);
  summary.addRow(['Total Booking', result.summary.total_booking]);
  summary.addRow(['Total Pendapatan', result.summary.total_pendapatan]);
  summary.getRow(4).getCell(2).numFmt = '"Rp"#,##0';
  summary.addRow(['Tingkat Okupansi (%)', result.summary.okupansi_persen]);
  summary.addRow(['Booking Dibatalkan', result.summary.total_dibatalkan]);
  summary.getRow(1).font = { bold: true, size: 13 };
  summary.getColumn(1).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="laporan-the-hotels_${from}_${to}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
