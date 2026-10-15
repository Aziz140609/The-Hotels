# 03 - Flows, Routes and State Machines

## 1. Route access matrix

| Route | Guest | User | Admin | If not allowed |
|---|---|---|---|---|
| `/`, `/kamar`, `/kamar/[id]`, `/about`, `/contact` | yes | yes | yes | - |
| `/login`, `/register`, `/lupa-password` | yes | redirect to `/` | redirect to `/admin` | redirect |
| `/reset-password` | via email link only | yes | yes | invalid-link frame |
| `/booking/[id]`, `/booking/[id]/status`, `/booking/[id]/bukti` | redirect `/login?next=...` | **own booking only** | own only (admin uses admin pages) | 404 (do not reveal existence) |
| `/akun/booking`, `/akun/profil` | redirect `/login?next=...` | yes | yes | - |
| `/admin/**` | redirect `/login?next=...` | **403 page** | yes | - |
| `/api/midtrans/notification` | public endpoint (Midtrans calls it), protected by signature | | | 401 on bad signature |
| `/api/midtrans/create-transaction` | 401 | own booking only | | |
| `/api/cron/expire-bookings` | needs `Authorization: Bearer CRON_SECRET` | | | 401 |

Enforcement is **layered**: (1) request interceptor (`middleware.ts` / `proxy.ts`) does an optimistic redirect using `supabase.auth.getUser()`; (2) every server component/action re-checks the user and role; (3) RLS in the database is the final guard. Never rely on only one layer. Never use `getSession()` for authorization on the server; use `getUser()`.

Post-login redirect: `next` query param is honored **only if it is a relative path starting with a single `/`** (reject `//`, `http:`, backslashes) to prevent open redirects. Default: admin -> `/admin`, user -> `/`.

## 2. Primary journeys

### 2.1 Guest searches rooms
1. `/` or `/kamar` -> user fills dates, guests, type, price range -> submit.
2. URL updates (`/kamar?checkin=...&checkout=...&guests=2&type=&price=&sort=asc`).
3. Server component validates params with Zod (invalid/missing -> fall back to defaults, never crash), calls `search_available_room_types`.
4. Show only types with `sisa_kamar > 0`. If none -> empty state with "Ubah Pencarian".
5. Click "Lihat Detail" -> `/kamar/[id]?checkin=...&checkout=...&guests=...` (params carried over).

### 2.2 Register / Login
- Register: Zod validate -> `supabase.auth.signUp({ email, password, options: { data: { nama_lengkap, no_hp } } })` -> trigger creates the profile (role `user`) -> if email confirmation is off the user is logged in, redirect to `next` or `/`; if on, show "Periksa email Anda".
- Login: `signInWithPassword` -> read `profiles.role` -> redirect admin to `/admin`, user to `next` or `/`. Generic failure message (never say which of email/password was wrong).
- Logout: server action `signOut`, redirect `/`.
- Forgot password: `resetPasswordForEmail(email, { redirectTo: SITE_URL + '/api/auth/callback?next=/reset-password' })`. Always show the same success message whether or not the email exists (prevents account enumeration).
- Reset password: only valid in a recovery session; call `updateUser({ password })`; then sign out other sessions and redirect to login with success toast.

### 2.3 Booking and payment (the core flow)

```
Guest clicks PESAN
  -> not logged in? open "wajib login" popup -> /login?next=<current URL> -> back here
User on /kamar or /kamar/[id] clicks PESAN (with valid dates, guests)
  -> server action createBooking(): Zod validate -> rpc create_booking (price + room chosen by DB)
       errors: NO_ROOM_AVAILABLE, GUEST_OVER_CAPACITY, ... (see docs/05)
  -> returns booking (status pending, expired_at = +60 min)
  -> redirect /booking/[id]  (checkout; guest data form pre-filled from profile; countdown)
User confirms guest data (can edit: nama, email, hp, catatan are re-validated)
  -> POST /api/midtrans/create-transaction { bookingId }
       server: auth user owns booking? status pending? not expired? -> create/reuse payments row (pending)
       -> Midtrans Snap createTransaction -> snap_token saved -> return { token }
  -> client: window.snap.pay(token, callbacks)
       onSuccess / onPending / onClose / onError  -> go to /booking/[id]/status (UI hint only)
Midtrans -> POST /api/midtrans/notification (webhook)  <-- the REAL source of truth
  -> verify signature -> update payments -> update booking status (see state machine)
/booking/[id]/status polls the server (every 3s, max 2 min) until payment is final, then shows result
```

Rule: the browser callbacks from Snap are **never** trusted to mark anything paid. Only the verified webhook (or a server-side status check, see `docs/07`) changes payment/booking state.

Guest data editing at checkout: because bookings columns `nama_tamu/email_tamu/no_hp_tamu/catatan` can change while status is `pending`, use a server action `updateBookingGuest` (owner only, pending only, Zod). Admin may edit `catatan` only.

### 2.4 User manages bookings (`/akun/booking`)
- List own bookings, newest first, 10 per page, search by code, filter by status and date.
- Actions by status: `pending` -> **Bayar** (resume payment: reuse the existing pending payment/token if still valid, else create a new order id) and **Batalkan**; `dikonfirmasi` -> **Batalkan** (only if check-in is at least 1 day ahead, else show "Hubungi hotel"), **Cetak Bukti**; `checked_in/selesai` -> **Cetak Bukti**; `dibatalkan` -> none.
- Cancel: confirm dialog -> `cancel_booking` rpc -> best-effort Midtrans cancel for the pending order -> toast. If the booking was already paid, show the note "Pengembalian dana diproses manual oleh hotel" (sandbox: no real refund).

### 2.5 Admin journeys
- **Dashboard**: `admin_dashboard_stats`, `admin_revenue_series(7|30)`, `admin_room_type_occupancy_today`, latest 5 bookings.
- **Tipe kamar CRUD**: create/edit in slide-over (with photo upload), delete with confirm; deleting a type that has rooms fails with FK error -> message "Masih ada kamar bertipe ini".
- **Kamar CRUD**: unique `nomor_kamar`; set `perawatan` to remove from availability (existing future bookings stay valid; show a warning count of affected future bookings before switching to `perawatan`).
- **Booking management**: search/filter; status changes limited to valid transitions (UI only shows allowed next actions); detail panel shows payment info; admin may delete only `dibatalkan` bookings.
- **Pengguna CRUD**: create via service-role `auth.admin.createUser` (email_confirm true, user_metadata) then set role if admin; edit name/phone/role; delete via `auth.admin.deleteUser` (fails with "Pengguna memiliki riwayat booking" if FK blocks; admin cannot delete or demote self).
- **Laporan**: filter by period/status, print, export (see `docs/08`).

## 3. State machines

### 3.1 Booking status
```
pending --(payment settled)--> dikonfirmasi --(admin: guest arrives)--> checked_in --(admin: guest leaves)--> selesai
pending --(user cancel | expired | payment expire/cancel/deny*)--> dibatalkan
dikonfirmasi --(user cancel >=1 day before | admin cancel)--> dibatalkan
dibatalkan --(system only: late settled payment while room still free)--> dikonfirmasi
```
*`deny`/`failure`: keep booking `pending` so the user can retry payment until `expired_at`; cancel only if the user cancels or time expires.

### 3.2 Payment status -> booking effect (webhook)

| Midtrans `transaction_status` (+ `fraud_status`) | `payments.transaction_status` | Booking effect |
|---|---|---|
| `pending` | pending | none |
| `settlement` | settlement | `pending -> dikonfirmasi` |
| `capture` + `fraud_status=accept` | capture | `pending -> dikonfirmasi` |
| `capture` + `fraud_status=challenge` | capture | none; `needs_review = true` (admin decides) |
| `deny`, `failure` | same | none (user may retry until `expired_at`) |
| `cancel`, `expire` | same | if booking still `pending` and no other payment of it is pending/paid -> `dibatalkan` |
| `refund`, `partial_refund`, `chargeback` | same | `needs_review = true`; no automatic status change |

Idempotency: webhooks can arrive duplicated or out of order. Never move a payment from a final state (`settlement`) back to `pending`. Process with "highest rank wins": `pending(0) < authorize/capture(1) < deny/failure/cancel/expire(2) < settlement(3) < refund*(4)`. Updating the booking to `dikonfirmasi` must be a no-op if it is already `dikonfirmasi`.

## 4. Pages and their loading/empty/error states

| Page | Loading | Empty | Error |
|---|---|---|---|
| `/kamar` | skeleton rows | "Tidak ada kamar yang tersedia" | inline retry block |
| `/akun/booking` | skeleton table | "Belum ada booking" | inline retry |
| `/admin` | skeleton stats/chart | zero values, "Belum ada data" in chart | per-widget retry; page still renders |
| Admin tables | skeleton rows | "Belum ada data" (+ "Hasil pencarian kosong" when filtered) | toast + retry |
| Checkout | skeleton | n/a | booking not found/expired -> state page |
| Status | spinner "Memeriksa pembayaran..." | n/a | after 2 min of polling: "Pembayaran masih diproses" with refresh button |

Implement with `loading.tsx` and `error.tsx` per route segment, plus Suspense around independent widgets.

## 5. Navigation details

- Navbar active link: `Home` = `/`, `Ruangan` = `/kamar*`, `About Us` = `/about`, `Contact` = `/contact`.
- Footer menu mirrors the navbar.
- After successful payment, "Lihat Booking Saya" -> `/akun/booking`; "Cetak Bukti" -> `/booking/[id]/bukti` (opens print dialog on a button click, not automatically).
- Browser back from checkout to the room page must not create a second booking: `createBooking` is only triggered by an explicit button press and the button disables on click (also see idempotency in `docs/04`).
