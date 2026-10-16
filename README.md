# The Hotels

Hotel room booking website for a single hotel. Visitors browse rooms, register/login, book a
room for a date range, and pay with **Midtrans Snap (Sandbox)**. Admins manage room types, rooms,
bookings, users, and print/export reports.

- **Stack**: Next.js 16 (App Router, TypeScript strict) + Tailwind CSS 4 + Supabase (Postgres, Auth, Storage) + Midtrans Snap.
- **Language**: UI in Indonesian, code/commits in English. Currency IDR, timezone Asia/Jakarta.

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
