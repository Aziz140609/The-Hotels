# 04 - Business Logic, Validation and Server Actions

## 1. Constants (`src/lib/constants.ts`: single place, no magic numbers elsewhere)

```ts
export const HOTEL = {
  name: 'The Hotels',
  address: 'Jl. Contoh No. 1, Surakarta, Jawa Tengah',
  phone: '+62 812-3456-7890',
  email: 'info@thehotels.id',
  mapEmbedUrl: '',            // user fills in
  checkInTime: '14.00',
  checkOutTime: '12.00',
} as const;

export const TIMEZONE = 'Asia/Jakarta';
export const BOOKING_HOLD_MINUTES = 60;      // MUST equal the interval in create_booking (schema.sql)
export const MAX_STAY_NIGHTS = 30;           // MUST equal STAY_TOO_LONG rule in schema.sql
export const MAX_ADVANCE_DAYS = 365;
export const MAX_GUESTS_SEARCH = 10;
export const MAX_PENDING_PER_USER = 3;       // MUST equal TOO_MANY_PENDING rule
export const CANCEL_MIN_DAYS_BEFORE = 1;     // confirmed bookings cancellable until 1 day before check-in
export const PAGE_SIZE = 10;
export const MAX_REPORT_RANGE_DAYS = 366;
export const PAYMENT_POLL_INTERVAL_MS = 3000;
export const PAYMENT_POLL_MAX_MS = 120000;
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
```
Also export the enum arrays from `docs/02` (`BOOKING_STATUSES`, `ROOM_STATUSES`, `ROLES`, `PAYMENT_STATUSES`) and the Indonesian label maps in section 9.

## 2. Date rules (the #1 source of bugs, follow exactly)

- A stay is `[check_in, check_out)`: the guest sleeps the nights from check-in up to, not including, check-out. Nights = `check_out - check_in` in calendar days.
- Dates travel as plain strings `YYYY-MM-DD` between browser, server and database. **Never** send `Date.toISOString()` for a date-only value (it shifts by timezone).
- Parse with `parseISO` from `date-fns`, compute nights with `differenceInCalendarDays(checkOut, checkIn)`.
- "Today" is `formatInTimeZone(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd')` (add `date-fns-tz`), not the server's local date (Vercel runs in UTC).
- Display format: `20 Okt 2026` (`d MMM yyyy`, locale `id`). Timestamps: `20 Okt 2026, 14.30 WIB`.
- Validation: check-in >= today, check-out > check-in, nights <= 30, check-in <= today + 365.

## 3. Pricing

`total = nights x room_types.harga_per_malam` (integer Rupiah, no tax/service fee, no decimals).
- The browser may *display* an estimate, but the amount that is charged is the one stored by `create_booking` (`bookings.total_harga`).
- Midtrans `gross_amount` MUST be read from the database booking row on the server, never from the request body.
- Format: `new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 })` then replace the non-breaking space so it renders `Rp1.000.000`.

## 4. Availability and search

- The database function `search_available_room_types` is the only way to compute availability. Do not re-implement it in TypeScript.
- A room type is shown if `sisa_kamar > 0`. Rooms with status `perawatan` are not counted. Expired-but-unswept pending bookings are treated as free.
- Search params (URL) schema `searchParamsSchema` (Zod, with defaults/coercion, **never throws**: use `safeParse` and fall back to defaults):

| Param | Rule | Default |
|---|---|---|
| `checkin` | valid `YYYY-MM-DD`, >= today | today |
| `checkout` | valid date > checkin, <= checkin + 30 | checkin + 1 |
| `guests` | int 1..10 | 1 |
| `type` | positive int or empty | none |
| `price` | `lt500` / `500-800` / `gt800` / empty | none |
| `sort` | `asc` / `desc` | `asc` |

Price mapping: `lt500` -> max 499999; `500-800` -> min 500000, max 800000; `gt800` -> min 800001.
If the incoming params were corrected (e.g., past date), show a subtle gold note "Tanggal disesuaikan".

## 5. Booking creation (server action `createBooking`)

Input: `{ roomTypeId, checkIn, checkOut, guests, guest?: {nama, email, hp, catatan} }`.
Steps:
1. `getUser()`; if none -> `ActionResult` error `UNAUTHENTICATED` (UI then shows login popup).
2. Zod-validate input (section 8).
3. **Idempotency / duplicate guard**: look for an existing `pending`, non-expired booking of this user with the same dates and a room of the same type. If found, return it (redirect to its checkout) instead of creating another. This prevents double click, refresh and back-button duplicates.
4. Guest data defaults: profile values (`nama_lengkap`, `email`, `no_hp`). The user edits them at checkout.
5. `supabase.rpc('create_booking', {...})` using the **user-scoped** client (so `auth.uid()` is the user).
6. On success return `{ ok: true, data: { bookingId } }` and redirect to `/booking/[id]`.
7. On error, map via `docs/05`.

The room (nomor kamar) is assigned by the database; the UI never lets the user choose a specific number.

## 6. Payment initiation (details in `docs/07`)

- Allowed only when: booking belongs to the user, status = `pending`, `expired_at > now() + 2 minutes`.
- Reuse the latest `payments` row if it is `pending`, has a `snap_token`, and its order is not older than the remaining hold; otherwise create a new `order_id`.
- `order_id` format: `ORD-{bookingId}-{unixSeconds}` (max 50 chars, unique).

## 7. Cancellation rules

| Booking status | User can cancel? | Admin can cancel? |
|---|---|---|
| `pending` | yes, anytime | yes |
| `dikonfirmasi` | yes if `check_in >= today + 1 day` (`CANCEL_MIN_DAYS_BEFORE`) | yes anytime before check-in |
| `checked_in`, `selesai`, `dibatalkan` | no | no |

After the DB cancel succeeds: best-effort call Midtrans cancel for any `pending` payment (ignore failure, but log it). If a paid booking is cancelled, set `payments.needs_review = true` so an admin sees it needs a manual refund (sandbox has no real refund).

## 8. Zod schemas (`src/lib/validators/*.ts`; reuse the same schema on client and server)

Shared primitives:
```ts
const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);
const name = trimmed(2, 100).regex(/^[\p{L}\p{M}' .-]+$/u, 'Nama hanya boleh huruf');
const email = z.string().trim().toLowerCase().email().max(255);
// accepts 08..., 628..., +628...; strip spaces and dashes BEFORE validating (z.preprocess)
const phone = z.preprocess(v => typeof v === 'string' ? v.replace(/[\s-]/g, '') : v,
  z.string().regex(/^(\+62|62|0)8[0-9]{8,11}$/, 'Nomor HP tidak valid'));
const password = z.string().min(8).max(72).regex(/[A-Za-z]/).regex(/[0-9]/); // 72 = bcrypt limit
```
Schemas and rules:

| Schema | Fields |
|---|---|
| `registerSchema` | `nama_lengkap: name`, `email`, `no_hp: phone` (optional), `password`, `konfirmasi` (must equal), `setuju: true` |
| `loginSchema` | `email`, `password: z.string().min(1).max(72)` |
| `forgotSchema` | `email` |
| `resetSchema` | `password`, `konfirmasi` |
| `profileSchema` | `nama_lengkap: name`, `no_hp: phone` optional |
| `changePasswordSchema` | `password_baru`, `konfirmasi`; (old password is verified by re-auth with `signInWithPassword` before `updateUser`) |
| `searchParamsSchema` | section 4 |
| `bookingInputSchema` | `roomTypeId: int>0`, `checkIn`, `checkOut` (date strings), `guests: int 1..10` |
| `bookingGuestSchema` | `nama: name`, `email`, `hp: phone`, `catatan: string max 500 optional` |
| `roomTypeSchema` | `nama 2..50`, `deskripsi <=1000 optional`, `harga_per_malam int 50_000..50_000_000`, `kapasitas int 1..10`, `fasilitas: string(1..30)[] max 15` (dedupe, trim), `foto` optional file |
| `roomSchema` | `nomor_kamar /^[A-Za-z0-9-]{1,10}$/`, `room_type_id int>0`, `lantai int 0..50 optional`, `status enum` |
| `adminUserSchema` (create) | `nama_lengkap`, `email`, `no_hp` optional, `password`, `role enum` |
| `adminUserEditSchema` | `nama_lengkap`, `no_hp` optional, `role enum` (email read-only) |
| `bookingStatusSchema` | `bookingId int>0`, `status enum` |
| `contactSchema` | `nama`, `email`, `subjek 3..150`, `pesan 5..2000`, `website` (honeypot, must be empty string) |
| `reportFilterSchema` | `from`, `to` (to >= from, range <= 366 days), `status` optional |

Error messages are Indonesian and short (see `docs/05` section 5). All schemas export their inferred types. **Never** pass raw `FormData`/JSON to Supabase without `schema.parse`.

## 9. Labels (Indonesian)

| Value | Label | Dot color |
|---|---|---|
| booking `pending` | Menunggu Pembayaran | muted gold |
| `dikonfirmasi` | Dikonfirmasi | soft green |
| `checked_in` | Check-in | blue-gray |
| `selesai` | Selesai | gray |
| `dibatalkan` | Dibatalkan | muted red |
| payment `settlement`/`capture(accept)` | Lunas | soft green |
| `pending`/`authorize` | Menunggu | muted gold |
| `deny`/`failure` | Gagal | muted red |
| `cancel` | Dibatalkan | muted red |
| `expire` | Kedaluwarsa | muted red |
| `refund*`/`chargeback*` | Dikembalikan | gray |
| room `tersedia` / `perawatan` | Tersedia / Perawatan | soft green / muted gold |
| role `admin` / `user` | Admin / User | - |

Admin "Ubah Status" shows only valid next actions: `pending` -> Konfirmasi, Batalkan; `dikonfirmasi` -> Check-in, Batalkan; `checked_in` -> Selesai; others none. Confirming manually from `pending` (admin override, e.g. cash payment) is allowed but creates no payment row; show the warning "Booking dikonfirmasi tanpa pembayaran online".

## 10. Server actions / handlers inventory (`src/lib/actions/*`)

All return `ActionResult<T>` (see `docs/05`). Each starts with `requireUser()` or `requireAdmin()` helpers from `lib/auth.ts` where needed.

| Action | Auth | Notes |
|---|---|---|
| `signUp, signIn, signOut, requestPasswordReset, resetPassword` | public / user | generic failure messages |
| `updateProfile, changePassword` | user | |
| `searchRoomTypes(params)` | public | wraps rpc; used by server components |
| `createBooking` | user | section 5 |
| `updateBookingGuest` | owner | status must be `pending` |
| `cancelBooking(bookingId)` | owner | rpc + Midtrans cancel |
| `adminSetBookingStatus` | admin | valid transitions only |
| `adminDeleteBooking` | admin | only `dibatalkan` |
| `createRoomType, updateRoomType, deleteRoomType` | admin | photo upload/replace/delete |
| `createRoom, updateRoom, deleteRoom` | admin | warn on maintenance with future bookings |
| `adminCreateUser, adminUpdateUser, adminDeleteUser` | admin | service-role client for auth admin API; cannot target self for delete/demote |
| `getReport(filter)` / export handlers | admin | `docs/08` |
| `submitContact` | public | honeypot + rate limit, service-role insert |
| `POST /api/midtrans/create-transaction` | user | `docs/07` |
| `POST /api/midtrans/notification` | Midtrans | `docs/07` |
| `GET /api/cron/expire-bookings` | `CRON_SECRET` | calls `expire_pending_bookings()` with the service-role client |

Lazy expiry safety net: every page that shows a booking's status (checkout, status, history) first treats `status = 'pending' AND expired_at < now()` as expired in the UI, and the server calls `expire_pending_bookings()` (service role) opportunistically when loading `/booking/[id]` and `/akun/booking`.

## 11. Pagination, search, filters

- Server-side only. Page param `?page=N` (1-based), clamp to valid range, page size 10.
- Search inputs debounce 300 ms and update the URL (`useRouter().replace`), so state survives refresh.
- Sanitize `q` before use in `ilike`/`or()` (strip `%`, `_`, `\`, `,`, `(`, `)`; max 50 chars).
- Date filters use the Jakarta-day boundaries.
