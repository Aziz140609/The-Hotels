# The Hotels

Hotel room booking website for a single hotel. Visitors browse rooms, register/login, book a
room for a date range, and pay with **Midtrans Snap (Sandbox)**. Admins manage room types, rooms,
bookings, users, and print/export reports.

- **Stack**: Next.js 16 (App Router, TypeScript strict) + Tailwind CSS 4 + Supabase (Postgres, Auth, Storage) + Midtrans Snap.
- **Language**: UI in Indonesian, code/commits in English. Currency IDR, timezone Asia/Jakarta.

---

## 📸 Alur Pemesanan Hotel (User Journey)

Berikut adalah tahapan alur lengkap proses pemesanan kamar hotel oleh tamu, mulai dari pencarian kamar hingga penerbitan bukti pembayaran:

### 1. Pencarian Kamar
Pengunjung menentukan tanggal **Check-in**, **Check-out**, dan **Jumlah Tamu** untuk mengecek ketersediaan kamar secara real-time.
<p align="center">
  <img src="public/screenshoot/cari%20kamar.png" alt="Pencarian Kamar" width="85%" />
</p>

---

### 2. Pilih Kategori & Filter Kamar
Pengunjung dapat memfilter katalog kamar berdasarkan kategori (*Standard*, *Deluxe*, *Suite*) maupun rentang harga yang diinginkan.
<p align="center">
  <img src="public/screenshoot/Pilih%20Ketegori.png" alt="Pilih Kategori" width="85%" />
</p>

---

### 3. Pemesanan Kamar (Detail & Reservasi)
Pengunjung melihat spesifikasi lengkap kamar (luas ruang, kapasitas, fasilitas utama, dan tarif per malam), memilih durasi menginap, lalu menekan tombol **"Pesan Sekarang"** untuk melanjutkan ke proses reservasi.
<p align="center">
  <img src="public/screenshoot/Pesan%20Kamar.png" alt="Pesan Kamar" width="85%" />
</p>

---

### 4. Status Pembayaran (Midtrans Snap Sandbox)
Sistem membuat transaksi pembayaran aman melalui payment gateway **Midtrans Snap**. Tamu dapat memilih metode pembayaran yang tersedia (QRIS, Virtual Account, Transfer Bank). Halaman status akan memverifikasi dan memperbarui status secara otomatis.
<p align="center">
  <img src="public/screenshoot/Status%20Pembayaran.png" alt="Status Pembayaran" width="85%" />
</p>

---

### 5. Bukti Pembayaran & Cetak Invoice
Setelah pembayaran berhasil terkonfirmasi (*Lunas*), tamu mendapatkan **Bukti Pembayaran / Invoice Resmi** yang memuat Kode Booking, rincian biaya, jadwal menginap, serta tombol untuk mencetak (*Print*) bukti reservasi fisik.
<p align="center">
  <img src="public/screenshoot/Bukti%20Pembayaran.png" alt="Bukti Pembayaran" width="85%" />
</p>

---

## 1. Prerequisites

- Node.js 20+ and npm
- A Supabase project (free tier is fine)
- A Midtrans Sandbox account (for payments)

## 2. Setup

```bash
npm install
cp .env.example .env.local   # then fill the values (see below)
```

### 2.1 Environment variables (`.env.local`)

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=            # Supabase > Project Settings > API > Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # anon / publishable key
SUPABASE_SERVICE_ROLE_KEY=           # service_role / secret key (SERVER ONLY)
MIDTRANS_SERVER_KEY=                 # Midtrans Sandbox > Settings > Access Keys
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=     # Midtrans Sandbox client key
MIDTRANS_IS_PRODUCTION=false
CRON_SECRET=                         # any long random string
```

Never prefix the service-role or Midtrans server key with `NEXT_PUBLIC_`.

### 2.2 Supabase

1. Create a project at supabase.com.
2. Open **SQL Editor**, paste the whole `supabase/schema.sql`, and Run. This creates the tables,
   functions, RLS policies, the `room-photos` storage bucket, and seed data.
3. **Auth > Providers > Email**: turn **off** "Confirm email" for local development.
4. Register an account in the app, then promote it to admin (SQL Editor, replace the email):

   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

5. Optional: enable `pg_cron` and schedule `public.expire_pending_bookings()` every 5 minutes
   (comment at the bottom of `schema.sql`). Otherwise use the `/api/cron/expire-bookings` route
   with the `CRON_SECRET`.

### 2.3 Midtrans (Sandbox)

1. Get the **Server Key** and **Client Key** from the Midtrans Sandbox dashboard and put them in
   `.env.local` (client key must be `NEXT_PUBLIC_`).
2. To receive payment notifications on localhost, expose your app publicly and register the
   Notification URL, e.g. with ngrok:

   ```bash
   ngrok http 3000
   ```

   Then in **Midtrans > Settings > Configuration**, set **Payment Notification URL** to
   `https://<your-ngrok-id>.ngrok-free.app/api/midtrans/notification`.
3. Pay with a Midtrans Sandbox test card/VA. The status page polls and updates automatically.

## 3. Run

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # type check
```

## 4. Key routes

| Area | Routes |
|---|---|
| Public | `/`, `/kamar`, `/kamar/[id]`, `/about`, `/contact` |
| Auth | `/login`, `/register`, `/lupa-password`, `/reset-password` |
| User | `/booking/[id]` (checkout), `/booking/[id]/status`, `/booking/[id]/bukti`, `/akun/booking`, `/akun/profil` |
| Admin | `/admin`, `/admin/tipe-kamar`, `/admin/kamar`, `/admin/booking`, `/admin/pengguna`, `/admin/laporan` (+ `/admin/laporan/cetak`) |
| API | `/api/midtrans/create-transaction`, `/api/midtrans/notification`, `/api/midtrans/status`, `/api/booking/[id]/guest`, `/api/auth/callback`, `/api/cron/expire-bookings`, `/api/admin/laporan/export` |

## 5. Notes

- Double booking is prevented in the database with an exclusion constraint on the room + date range.
- Prices, availability and payment status are always computed/verified server-side.
- See `docs/FINAL-REPORT.md` for the build summary, verified results and known limitations.
