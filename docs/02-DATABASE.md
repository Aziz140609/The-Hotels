# 02 - Database (Supabase / PostgreSQL)

The complete, ready-to-run SQL is in **`supabase/schema.sql`** (single source of truth).
This document explains it so you can use it correctly. **Do not invent tables, columns, functions, or status values that are not in `schema.sql`.**

## 1. How to apply

1. Create a Supabase project (free tier is fine).
2. Dashboard > SQL Editor > paste the whole `supabase/schema.sql` > Run. Run it once on an empty project. If it must be re-run, drop the `public` objects first or reset the project.
3. Register the first account through the app, then run the "FIRST ADMIN" SQL at the bottom of `schema.sql` with that email.
4. Auth settings: Dashboard > Authentication > Providers > Email enabled. For development turn **"Confirm email" off** (otherwise registration needs SMTP). Note this in `docs/FINAL-REPORT.md`. Set Site URL = `http://localhost:3000` and add `http://localhost:3000/api/auth/callback` to Redirect URLs.
5. Optional: enable `pg_cron` and run the commented schedule at the end of `schema.sql`; otherwise the app calls the expire endpoint (see `docs/07`).

Types: if the Supabase CLI is available run `npx supabase gen types typescript --project-id <id> > src/types/database.ts`; otherwise hand-write `src/types/database.ts` from the tables below. Keep one `Database` type and pass it to `createClient<Database>()`.

## 2. Tables

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | App user data and role. 1:1 with `auth.users`. Passwords live only in Supabase Auth (bcrypt). | `id` (= auth user id), `nama_lengkap`, `email`, `no_hp`, `role` (`admin`/`user`) |
| `room_types` | Catalog of room kinds | `nama`, `deskripsi`, `harga_per_malam`, `kapasitas`, `fasilitas text[]`, `foto_url` |
| `rooms` | Physical rooms | `nomor_kamar`, `room_type_id`, `lantai`, `status` (`tersedia`/`perawatan`) |
| `bookings` | Reservations | `kode_booking`, `user_id`, `room_id`, `check_in`, `check_out`, `jumlah_tamu`, `total_harga`, `status`, guest snapshot (`nama_tamu`, `email_tamu`, `no_hp_tamu`), `catatan`, `expired_at` |
| `payments` | Midtrans transactions | `booking_id`, `order_id`, `snap_token`, `gross_amount`, `payment_type`, `transaction_status`, `fraud_status`, `settlement_time`, `raw_notification`, `needs_review`, `is_paid` (generated) |
| `messages` | Contact form messages | `nama`, `email`, `subjek`, `pesan`, `is_read` |

### Differences from the spreadsheet design (intentional, already in schema.sql)
- `bookings` gained `nama_tamu`, `email_tamu`, `no_hp_tamu` (the checkout form collects guest data that can differ from the profile).
- Booking status `check_in` was renamed **`checked_in`** (avoids confusion with the `check_in` date column).
- `payments` gained `needs_review` and generated `is_paid`; `email` is `varchar(255)`.
- New `messages` table for the Contact form.

### Allowed values (enums are plain `varchar` + `CHECK`)
- `profiles.role`: `admin`, `user`
- `rooms.status`: `tersedia`, `perawatan`
- `bookings.status`: `pending`, `dikonfirmasi`, `checked_in`, `selesai`, `dibatalkan`
- `payments.transaction_status`: `pending`, `authorize`, `capture`, `settlement`, `deny`, `cancel`, `expire`, `failure`, `refund`, `partial_refund`, `chargeback`, `partial_chargeback`
Mirror these in `src/lib/constants.ts` as `as const` arrays and derive TypeScript union types from them.

## 3. Database-enforced rules (do not re-implement them differently in the app)

| Rule | Mechanism |
|---|---|
| No double booking | `EXCLUDE USING gist (room_id WITH =, daterange(check_in, check_out, '[)') WITH &&) WHERE (status <> 'dibatalkan')`. Stays are half-open: a guest checking out on the 22nd and another checking in on the 22nd do **not** conflict. |
| Check-out after check-in | `CHECK (check_out > check_in)` |
| Role cannot be self-escalated, email cannot be self-changed | trigger `guard_profile_update` |
| Last admin cannot be demoted/deleted | triggers `guard_profile_update/delete` (`LAST_ADMIN`) |
| Booking status machine | trigger `guard_booking_update`: `pending -> dikonfirmasi/dibatalkan`, `dikonfirmasi -> checked_in/dibatalkan`, `checked_in -> selesai`. Only the system (service role) may move `dibatalkan -> dikonfirmasi` (late payment). |
| Immutable booking fields | `kode_booking, user_id, room_id, check_in, check_out, total_harga, jumlah_tamu` cannot change after insert. To change dates/room: cancel and rebook. |
| Payment amount integrity | trigger `guard_payment_amount`: `payments.gross_amount` must equal `bookings.total_harga` |
| Profile auto-creation | trigger `on_auth_user_created`; role is always `user` regardless of signup metadata |
| Price computed server-side | `create_booking` computes `total_harga = nights * room_types.harga_per_malam` |
| Free-room assignment | `create_booking` loops over free rooms of the type and retries on `exclusion_violation` (race-safe) |
| Pending hold | `create_booking` sets `expired_at = now() + 60 minutes`; `expire_pending_bookings()` cancels expired pending bookings |
| Anti-hoarding | max 3 unpaid (pending, not expired) bookings per user (`TOO_MANY_PENDING`) |

## 4. RPC functions (call with `supabase.rpc(name, args)`)

| Function | Caller | Args | Returns |
|---|---|---|---|
| `search_available_room_types` | anon + user | `p_check_in, p_check_out, p_guests, p_room_type_id, p_min_price, p_max_price, p_sort ('harga_asc'/'harga_desc')` | rows: `id, nama, deskripsi, harga_per_malam, kapasitas, fasilitas, foto_url, sisa_kamar` |
| `create_booking` | user | `p_room_type_id, p_check_in, p_check_out, p_jumlah_tamu, p_nama_tamu, p_email_tamu, p_no_hp_tamu, p_catatan` | the new `bookings` row |
| `cancel_booking` | user | `p_booking_id` | the updated `bookings` row |
| `report_summary` | admin | `p_from, p_to` | `total_booking, total_pendapatan, okupansi_persen, total_dibatalkan` |
| `admin_dashboard_stats` | admin | none | `booking_hari_ini, pendapatan_bulan_ini, okupansi_persen, menunggu_pembayaran` |
| `admin_revenue_series` | admin | `p_days` (1-90) | rows `tanggal, pendapatan` |
| `admin_room_type_occupancy_today` | admin | none | rows `room_type_id, nama, total, terisi` |
| `expire_pending_bookings` | service role only | none | void |

Dates are passed as `'YYYY-MM-DD'` strings (never as JS `Date` objects) to avoid timezone shifts.

### Error codes raised by functions/triggers
`error.message` equals one of these exact strings (Postgres code `P0001`). Map them with `docs/05-ERROR-HANDLING.md`.

`UNAUTHENTICATED, TOO_MANY_PENDING, INVALID_DATES, PAST_DATE, DATE_TOO_FAR, STAY_TOO_LONG, INVALID_GUEST_NAME, INVALID_EMAIL, INVALID_PHONE, ROOM_TYPE_NOT_FOUND, GUEST_OVER_CAPACITY, NO_ROOM_AVAILABLE, BOOKING_NOT_FOUND, CANCEL_NOT_ALLOWED, FORBIDDEN, INVALID_RANGE, FORBIDDEN_ROLE_CHANGE, FORBIDDEN_EMAIL_CHANGE, IMMUTABLE_FIELD, LAST_ADMIN, INVALID_STATUS_TRANSITION, AMOUNT_MISMATCH`

Standard Postgres codes you must also handle: `23505` unique violation, `23503` foreign key violation, `23514` check violation, `23P01` exclusion violation, `42501` insufficient privilege (RLS), `PGRST116` (no rows for `.single()`).

## 5. Row Level Security summary

| Table | anon | authenticated user | admin |
|---|---|---|---|
| `room_types` | read | read | full CRUD |
| `rooms` | none | read | full CRUD |
| `profiles` | none | read/update **own** row (not role/email) | read all, update all, delete |
| `bookings` | none | read **own**; create only via `create_booking`; cancel only via `cancel_booking` | read all, update (status/notes), delete only cancelled |
| `payments` | none | read own (via booking) | read all |
| `messages` | none | none | read, mark read, delete |
| Storage `room-photos` | read | read | upload/replace/delete |

`payments` and `messages` inserts, and all payment updates, are done **only by server code using the service-role client** (`lib/supabase/admin.ts`). Never expose that client to the browser.

## 6. Query patterns

Use `supabase-js` (parameterized, no string-built SQL anywhere). Never call `.rpc('exec_sql')` or build SQL with template strings.

```ts
// user's bookings with room + payment (RLS limits rows to the owner)
supabase
  .from('bookings')
  .select('*, rooms(nomor_kamar, room_types(nama, foto_url)), payments(order_id, transaction_status, is_paid)')
  .order('created_at', { ascending: false })
  .range(from, to)

// search by booking code (escape % and _ in user text before using ilike)
.ilike('kode_booking', `%${escapeLike(q)}%`)
```
Rules: always paginate lists (`.range()`, page size 10), always select explicit columns on public pages, use `{ count: 'exact' }` only where a total is shown, never `select('*')` on `profiles` in public-facing code.

Admin booking search matches `kode_booking`, `nama_tamu`, `email_tamu` (use `.or('kode_booking.ilike.%q%,nama_tamu.ilike.%q%,email_tamu.ilike.%q%')` with sanitized `q`: strip commas, parentheses and `%`/`_`/`\` before interpolating into the `or()` filter string).

## 7. Storage

Bucket `room-photos` (public read, 2 MB max, jpeg/png/webp). Upload path: `room-types/{roomTypeId}/{timestamp}-{slug}.{ext}`. Store the **public URL** in `room_types.foto_url`. When replacing a photo, delete the old object. Validate file type and size on the client AND server action before upload.

## 8. Self-check (run after applying the schema)

```sql
select count(*) from public.room_types;   -- expect 3
select count(*) from public.rooms;        -- expect 16
select * from public.search_available_room_types(current_date, current_date + 2, 2);  -- expect 3 rows, sisa_kamar 6/8/2
```
Then verify RLS in the app tests of `docs/09-TESTING-QA.md`.
