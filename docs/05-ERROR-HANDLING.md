# 05 - Error Handling and Edge Cases

Principle: **no user ever sees a stack trace, SQL text, or raw English error.** Every failure ends in a calm Indonesian message with a next step, and the app stays usable.

## 1. Universal result type

```ts
// src/lib/errors.ts
export type ErrorCode =
  | 'VALIDATION' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT'
  | 'RATE_LIMITED' | 'EXTERNAL_SERVICE' | 'NETWORK' | 'UNKNOWN'
  | DbBusinessCode;                       // codes from docs/02 section 4

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> };
```
Rules:
- Server actions **never throw** to the client (except `redirect()`/`notFound()` from Next, which must not be caught by a blanket `try/catch`: rethrow if `isRedirectError`/`isNotFoundError`).
- Wrap each action body: `try { ... } catch (e) { return fail(e) }`, where `fail` = `mapError` + `logError`.
- Forms read `fieldErrors` to show messages under inputs and `message` for a toast/banner.

## 2. `mapError(e: unknown): { code, message, fieldErrors? }` (single function, unit-tested)

Order of checks:
1. `ZodError` -> `VALIDATION` + `fieldErrors` from `flatten()`; message "Periksa kembali data yang Anda isi."
2. Supabase Auth error (`AuthApiError`, has `status`/`code`) -> section 4.
3. Postgrest/Postgres error (`{ code, message, details }`):
   - if `message` is one of the business codes -> section 3 table
   - else by `code`: section 3b
4. Midtrans/fetch errors -> `EXTERNAL_SERVICE`, "Layanan pembayaran sedang bermasalah. Coba lagi sesaat lagi."
5. `TypeError: fetch failed` / `AbortError` -> `NETWORK`, "Koneksi bermasalah. Periksa internet Anda lalu coba lagi."
6. Anything else -> `UNKNOWN`, "Terjadi kesalahan. Silakan coba lagi." (log the real error with a short `errorId` and show "Kode: ABC123" in small text so the user can report it)

## 3. Database error mapping

### 3a. Business codes raised by SQL (`error.message` equals the code)

| Code | Message shown (Indonesian) |
|---|---|
| `UNAUTHENTICATED` | Silakan masuk terlebih dahulu. (open login popup / redirect) |
| `TOO_MANY_PENDING` | Anda memiliki 3 pesanan yang belum dibayar. Selesaikan atau batalkan salah satunya terlebih dahulu. |
| `INVALID_DATES` | Tanggal check-out harus setelah tanggal check-in. |
| `PAST_DATE` | Tanggal check-in tidak boleh sebelum hari ini. |
| `DATE_TOO_FAR` | Pemesanan hanya dapat dilakukan maksimal 1 tahun ke depan. |
| `STAY_TOO_LONG` | Lama menginap maksimal 30 malam. |
| `INVALID_GUEST_NAME` / `INVALID_EMAIL` / `INVALID_PHONE` | Data tamu tidak valid. Periksa nama, email, dan nomor HP. |
| `ROOM_TYPE_NOT_FOUND` | Tipe kamar tidak ditemukan. |
| `GUEST_OVER_CAPACITY` | Jumlah tamu melebihi kapasitas kamar ini. |
| `NO_ROOM_AVAILABLE` | Maaf, kamar baru saja terisi untuk tanggal tersebut. Silakan pilih tanggal atau tipe lain. |
| `BOOKING_NOT_FOUND` | Booking tidak ditemukan. |
| `CANCEL_NOT_ALLOWED` | Booking ini tidak dapat dibatalkan lagi. Silakan hubungi hotel. |
| `FORBIDDEN`, `FORBIDDEN_ROLE_CHANGE`, `FORBIDDEN_EMAIL_CHANGE` | Anda tidak memiliki akses untuk tindakan ini. |
| `INVALID_RANGE` | Rentang tanggal tidak valid. |
| `IMMUTABLE_FIELD` | Data ini tidak dapat diubah. Batalkan dan buat booking baru. |
| `LAST_ADMIN` | Tidak dapat menghapus atau menurunkan admin terakhir. |
| `INVALID_STATUS_TRANSITION` | Status booking sudah berubah. Muat ulang halaman lalu coba lagi. (also refetch the row) |
| `AMOUNT_MISMATCH` | Nominal pembayaran tidak sesuai. Silakan muat ulang halaman. (log as security event) |

### 3b. Standard Postgres / PostgREST codes (context-aware)

| Code | Meaning | Message (use field/table context when known) |
|---|---|---|
| `23505` | unique violation | Email: "Email sudah terdaftar." Nomor kamar: "Nomor kamar sudah digunakan." Nama tipe: "Nama tipe kamar sudah ada." Else: "Data sudah ada." |
| `23503` | FK violation | On delete: tipe kamar -> "Tipe ini masih memiliki kamar." ; kamar -> "Kamar ini memiliki riwayat booking."; pengguna -> "Pengguna ini memiliki riwayat booking." |
| `23514` | check violation | "Ada data yang tidak memenuhi aturan. Periksa kembali isian Anda." |
| `23P01` | exclusion violation | "Kamar sudah dipesan pada tanggal tersebut." |
| `23502` | not null | "Ada data wajib yang belum diisi." |
| `22P02`, `22007`, `22008` | bad input syntax/date | "Format data tidak valid." |
| `42501` | RLS / privilege | "Anda tidak memiliki akses." (also log: possible tampering) |
| `PGRST116` | `.single()` found 0 or >1 rows | treat as `NOT_FOUND` |
| `57014` | statement timeout | "Permintaan terlalu lama. Coba lagi." |
| `PGRST301`, `401`, "JWT expired" | session expired | refresh session once; if still failing -> redirect to `/login?next=...` with toast "Sesi Anda berakhir. Silakan masuk lagi." |

To pick the field/table context for `23505`/`23503`, parse `error.details`/`error.message` for the constraint name (e.g. `rooms_nomor_kamar_key`, `profiles_email_key`, `room_types_nama_key`) rather than showing it.

## 4. Auth error mapping (Supabase Auth)

| Condition | Message |
|---|---|
| `invalid_credentials` | Email atau password salah. (never reveal which) |
| `email_not_confirmed` | Email belum dikonfirmasi. Periksa kotak masuk Anda. |
| `user_already_exists` / signUp returns a user with empty `identities` | Email sudah terdaftar. Silakan masuk. |
| `weak_password` | Password terlalu lemah. Gunakan minimal 8 karakter dengan huruf dan angka. |
| `same_password` | Password baru tidak boleh sama dengan yang lama. |
| `over_request_rate_limit`, `over_email_send_rate_limit`, HTTP 429 | Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi. |
| `otp_expired`, `flow_state_not_found`, invalid/expired recovery link | Tautan tidak valid atau sudah kedaluwarsa. (show "MINTA TAUTAN BARU") |
| `session_not_found`, `refresh_token_not_found` | Sesi Anda berakhir. Silakan masuk lagi. |

## 5. Validation messages (Zod, Indonesian)

Set a global `z.setErrorMap` (or per-schema messages) so defaults are Indonesian: required -> "Wajib diisi"; min length -> "Minimal {n} karakter"; max -> "Maksimal {n} karakter"; email -> "Format email tidak valid"; phone -> "Nomor HP tidak valid (contoh: 081234567890)"; password -> "Minimal 8 karakter, kombinasi huruf dan angka"; confirm -> "Password tidak sama"; number range -> "Harus antara {min} dan {max}"; date -> "Tanggal tidak valid"; file type -> "Hanya JPG, PNG, atau WebP"; file size -> "Ukuran maksimal 2 MB".
Inline errors appear on blur and on submit; the first invalid field receives focus on submit.

## 6. UI error surfaces

| Surface | Use for |
|---|---|
| Inline field error (muted red under the underline) | validation |
| Toast (error, 6s) | action failed, network, unknown |
| Inline banner at the top of a form | errors that are not tied to a field (e.g. "Email atau password salah") |
| Confirm/inline state in a page | `NO_ROOM_AVAILABLE`, expired booking: show a state with a button to go back/search again |
| `error.tsx` (per segment, with "Coba Lagi" button calling `reset()`) | unexpected render/data errors in a segment |
| `global-error.tsx` | root layout crash; minimal emerald/gold page, no dependency on app components |
| `not-found.tsx` | 404; also use `notFound()` for missing/unauthorized resources (do not reveal existence) |
| `forbidden` page (403) | logged-in non-admin opening `/admin/**` |

Rules: keep the form values after an error; re-enable the submit button; never clear a password field except after a successful change; focus moves to the error summary or first invalid field; error text uses `role="alert"`.

## 7. Logging (server only)

`src/lib/logger.ts`: `logError(context, error, meta?)` prints one JSON line `{ level, errorId, context, code, message, userId?, route, time }`.
- **Redact** always: passwords, tokens, `snap_token`, server keys, full Authorization headers, `raw_notification` bodies (log only `order_id` and status).
- Never `console.log` a request body. No PII (email/phone) in logs; use `userId`.
- Security-relevant events to log at `warn`: bad webhook signature, `AMOUNT_MISMATCH`, `42501`, role-change attempt, cron without secret.

## 8. Timeouts, retries, resilience

- All external calls (Midtrans) have a timeout of 10s (`AbortController`) and **no automatic retry for non-idempotent calls**. Creating a transaction may be retried by the user pressing the button again (the server reuses the pending order).
- Supabase calls on server: no retry; on read pages show the error state with a retry button.
- Webhook handler: respond 200 quickly after processing; respond 5xx only for genuinely transient failures (DB down) so Midtrans retries; respond 200 for events you intentionally ignore; respond 401 for a bad signature.

## 9. Edge case catalogue (each must be handled; tests are in `docs/09`)

**Booking and availability**
1. Two users book the last room at the same instant -> exactly one succeeds, the other gets `NO_ROOM_AVAILABLE` (DB exclusion + retry loop).
2. Double click on PESAN / refresh / back button -> one booking only (duplicate guard + disabled button).
3. User opens checkout after `expired_at` -> state page "Waktu pembayaran habis" + "Pesan Lagi"; never allow pay.
4. Booking expires while the Snap popup is open -> the server rejects new transactions; a webhook `expire` cancels the booking; the status page shows "gagal/kedaluwarsa".
5. Payment settles **after** the booking was auto-cancelled (late webhook): try to move `dibatalkan -> dikonfirmasi` with the service role; if the DB refuses (room taken by another guest), keep `dibatalkan`, set `payments.needs_review = true`, and surface it in the admin booking detail ("Pembayaran masuk setelah booking dibatalkan - perlu refund manual").
6. Same-day turnover (guest A out on the 22nd, guest B in on the 22nd) is allowed ([) intervals).
7. Check-in = today is allowed; past dates are rejected; URL tampering with past/invalid dates falls back to defaults.
8. Capacity exceeded (guests > kapasitas) -> blocked in UI and DB.
9. User already has 3 pending bookings -> `TOO_MANY_PENDING`.
10. Room set to `perawatan` while future bookings exist -> allowed but admin sees a warning with the count; those bookings remain valid and are listed so the hotel can reassign manually (no auto-reassignment in v1).
11. Booking made for a type whose all rooms are in maintenance -> `NO_ROOM_AVAILABLE`.
12. Midnight boundary (23:59 -> 00:00 WIB): "today" always computed in Asia/Jakarta.

**Payment**
13. Duplicate webhook deliveries -> idempotent (no double effects, no error).
14. Webhook arrives before the user returns, or never arrives (localhost without tunnel): status page also performs a **server-side status check** against Midtrans (`docs/07`) when still pending after 10s.
15. Out-of-order webhooks (`settlement` then `pending`) -> ranking rule, never downgrade.
16. Webhook for unknown `order_id` -> log warn, respond 200 (Midtrans "Test notification" uses fake ids).
17. Webhook with bad/missing signature -> 401, no DB change.
18. Midtrans amount differs from DB -> reject, log security event.
19. Snap script fails to load (ad blocker/offline) -> message "Gagal memuat pembayaran. Muat ulang halaman." with reload button.
20. User closes the popup without paying -> stay on checkout, toast info "Pembayaran belum diselesaikan", button remains usable.
21. User pays in two tabs -> second attempt reuses the same pending order; once settled the second tab redirects to status.
22. Midtrans API down/timeouts -> `EXTERNAL_SERVICE` toast; booking stays pending and still has its hold.
23. `capture` with `fraud_status=challenge` -> `needs_review`; do not confirm.

**Auth and permissions**
24. Session expires mid-form -> action returns `UNAUTHENTICATED`; preserve typed data (sessionStorage for checkout form is acceptable) and redirect to login with `next`.
25. User calls the API/RPC directly to set role, read others' bookings, set price -> blocked by triggers/RLS (tested).
26. Normal user opens `/admin` -> 403 page (not a redirect loop).
27. Admin deletes or demotes themselves, or the last admin -> blocked (`LAST_ADMIN` / self check).
28. Logged-in user visits `/login` -> redirected away.
29. `next` param is `//evil.com` or `https://...` -> ignored.
30. Account enumeration on forgot-password/register messages -> uniform messages for forgot-password.

**Input and data**
31. Emoji/Unicode/very long names, HTML (`<script>`) and SQL (`' OR 1=1 --`) in every text field -> stored as plain text, rendered escaped, no errors (React escapes by default; never use `dangerouslySetInnerHTML` with user data).
32. Whitespace-only fields -> treated as empty (trim).
33. Negative/zero/decimal/huge numbers for price or capacity -> validation errors.
34. Upload of wrong type, renamed `.exe`, oversize file, or empty file -> rejected on client and server (check MIME *and* extension, size <= 2 MB).
35. Replacing a photo fails after uploading the new one -> keep the old URL, delete the orphan object.
36. Search with `%`, `_`, `\`, commas, parentheses -> sanitized, no filter-injection errors.
37. Pagination page beyond last page / negative / NaN -> clamp.
38. Deleting the only row on the last page -> go to previous page.
39. Two admins edit the same booking: second change hits `INVALID_STATUS_TRANSITION` -> message + refetch.
40. Duplicate room number / room type name / email -> friendly `23505` message under the right field.
41. Delete a room type with rooms, a room with bookings, or a user with bookings -> friendly `23503` message (no data lost).

**Reports and printing**
42. Empty period -> report page shows zeros and "Tidak ada data"; export buttons still work and produce a valid file with only headers and a zero total row.
43. Large result (> 5,000 rows) -> export streams/paginates server-side; print view warns "Gunakan ekspor untuk data besar".
44. Invalid range (to < from, > 366 days) -> validation error.
45. Currency/date formatting consistent across table, PDF, Excel (Excel must keep numbers numeric, not strings).

**Environment**
46. Missing env var -> app refuses to start with a clear message naming the variable (never its value).
47. Supabase unreachable -> pages show error state; `/` (landing) still renders static parts.
48. Cold-start/slow responses -> skeletons; no layout jump.
