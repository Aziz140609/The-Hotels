# 08 - Reports: Print, PDF, Excel

Exam requirement: a report that can be **printed or exported (PDF/Excel)**. Implement all three (print, PDF, Excel); they must show identical numbers.

## 1. Report definition

Page: `/admin/laporan` (admin only).
Filters: `from` (default: first day of the current month), `to` (default: today), `status` (all / booking status), validated by `reportFilterSchema` (to >= from, max 366 days). Filters live in the URL.

**Rows** = bookings whose **created date (Asia/Jakarta)** is within `[from, to]`, optionally filtered by status. Fetch with the user-scoped admin client (RLS allows admin). Boundaries: `created_at >= '<from>T00:00:00+07:00'` and `created_at < '<to+1>T00:00:00+07:00'`.

| Column | Source |
|---|---|
| Tanggal | `created_at` (format `dd/MM/yyyy`) |
| Kode Booking | `kode_booking` |
| Tamu | `nama_tamu` |
| Kamar | `rooms.nomor_kamar` + `room_types.nama` |
| Check-in / Check-out | dates |
| Malam | `check_out - check_in` |
| Total | `total_harga` |
| Pembayaran | latest payment label (Lunas / Menunggu / Gagal / Kedaluwarsa / -) |
| Status | booking status label |

**Summary** (from `rpc('report_summary')`, the single source for these four numbers):
Total Booking, Total Pendapatan (sum of **paid** payments of bookings created in range), Tingkat Okupansi (occupied room-nights / (all rooms x days in range) x 100, rounded to 1 decimal; counts `dikonfirmasi`, `checked_in`, `selesai` stays overlapping the range), Booking Dibatalkan.

The table's "Total" footer line = sum of `Total` for rows whose payment is paid. A unit test and a manual check must confirm it equals `total_pendapatan` for the same filter (when no status filter is applied).

Pagination on screen: 10 rows/page. Print and export use **all** rows (cap 5,000; above that show a message to narrow the period).

## 2. Print

- Route `/admin/laporan/cetak?from=&to=&status=` using its own layout (no sidebar/navbar), admin-guarded server component.
- White A4 landscape: centered "THE HOTELS" (serif), thin gold line (`#C9A96E`), title "LAPORAN BOOKING", period "01 Okt 2026 - 31 Okt 2026", printed-at timestamp (WIB), summary line (4 figures), full table, bold total row, signature block bottom-right ("Admin, ____" with printed date).
- CSS: `@page { size: A4 landscape; margin: 14mm }`, `thead { display: table-header-group }` (repeat header on each page), `tr { break-inside: avoid }`, hide the toolbar with `print:hidden`, font-size 10-11px, black text.
- The "CETAK" button on `/admin/laporan` opens this route in a new tab; the page has a "Cetak" button that calls `window.print()` (do not auto-print).

## 3. PDF export (client-side, `jspdf` + `jspdf-autotable`)

- Triggered by EKSPOR > PDF. Fetch all rows through a server action (same query as print) then build the PDF in the browser (dynamic `import()` so the libraries are not in the initial bundle).
- A4 landscape. Header: "THE HOTELS", "Laporan Booking", period, generated date; summary block; table with autoTable (header row fill emerald `#0B2B26` with ivory text, body 8-9pt, zebra off, thin lines gold-ish gray); totals row; footer with page numbers "Halaman x dari y"; signature area on the last page.
- Use the built-in Helvetica font (the custom serif fonts are not required in the PDF). Right-align numbers, format `Rp1.000.000`.
- File name: `laporan-the-hotels_<from>_<to>.pdf`.

## 4. Excel export (server-side route, `exceljs`)

- Route `GET /api/admin/laporan/export?format=xlsx&from=&to=&status=`: `requireAdmin()`, validate params, query rows, build the workbook, respond with
  `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` and `Content-Disposition: attachment; filename="laporan-the-hotels_<from>_<to>.xlsx"`. `Cache-Control: no-store`.
- Sheet **Laporan**: title rows (hotel, report title, period), blank row, header row (bold, emerald fill, ivory font, frozen pane, autofilter), data rows with **real types**: dates as Excel dates (`dd/mm/yyyy`), numbers numeric with format `"Rp"#,##0`, nights numeric. Last row: `TOTAL` with a **formula** `=SUM(...)` over the paid-total column (or over a helper column "Total Dibayar" that is `Total` when paid else 0).
- Sheet **Ringkasan**: the four summary figures (values, not formulas) and filter parameters.
- Column widths set; text values are plain strings (never start a string cell with `=`; ExcelJS writes strings as text, but do not use formula objects for user data).
- Return 400 for invalid params, 401/403 for non-admin, 200 with an empty-but-valid workbook when there are no rows.

## 5. Booking proof (`/booking/[id]/bukti`)

White A4 page for the owner (ownership check, 404 otherwise). Content per design screen 33: hotel header, "BUKTI BOOKING", code, status "LUNAS" (only when payment is paid; otherwise show "BELUM LUNAS" and disable printing of proof? Show the page but label clearly), guest and stay details, total, QR placeholder (encode `kode_booking`; use a small QR library or leave the placeholder box), check-in/out times from `HOTEL` constants, closing line. Print CSS as above (A4 portrait). The "CETAK BUKTI" buttons open this route.

## 6. Done checklist
- [ ] On-screen report, print view, PDF, Excel all show the same 4 summary numbers and the same total
- [ ] Empty period produces valid outputs
- [ ] Wide table fits A4 landscape without clipping
- [ ] Excel numbers/dates are numeric/date typed (verify by summing a column in Excel)
- [ ] Non-admin gets 403 on all report routes
