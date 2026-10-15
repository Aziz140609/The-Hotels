# 09 - Testing, QA and Exam Demo

## 1. Automated tests (Vitest; keep them fast and deterministic)

Install `vitest` (+ `@vitest/coverage-v8` optional). Add `"test": "vitest run"` to `package.json`. Unit tests are required for the pure logic:

| Area | Cases |
|---|---|
| `mapError` | every business code, `23505` per constraint, `23503`, auth errors, ZodError -> fieldErrors, network error, unknown |
| Validators | register/login/booking guest/room type/room/contact/report filter: valid, boundary, invalid, whitespace-only, emoji, 10k-char string, HTML/SQL strings |
| Phone | `081234567890`, `+6281234567890`, `6281234567890`, `0812-3456-7890` (normalized), `12345`, letters |
| Dates/price | nights calc, same-day turnover, Jakarta "today" near midnight UTC, `total = nights x price`, 30-night limit |
| Search params | missing/invalid/past dates fall back to defaults; price mapping |
| Midtrans helpers | signature valid/invalid/tampered amount, rank guard, status -> booking effect mapping, `order_id` format |
| `next` redirect sanitizer | `/akun/booking` ok; `//evil.com`, `https://x`, `\\x`, empty -> default |

Tests must run without network or secrets (mock Supabase/Midtrans).

## 2. Database tests (run in the Supabase SQL Editor; paste results into FINAL-REPORT)

Use the seeded data. Replace UUIDs with real ones from `profiles`.

1. **Double booking constraint**: as admin (SQL Editor) insert two bookings for the same `room_id` with overlapping dates and status `pending` -> second fails with `23P01`. Insert one with check-in = other's check-out -> succeeds. Set the first to `dibatalkan`, insert overlapping again -> succeeds.
2. **create_booking race**: see section 3.
3. **Immutable fields**: `update bookings set total_harga = 1 where id = ...` -> `IMMUTABLE_FIELD`.
4. **Status machine**: `selesai -> pending` fails; `pending -> checked_in` fails.
5. **Payment amount**: insert a `payments` row with a different `gross_amount` than the booking -> `AMOUNT_MISMATCH`.
6. **Last admin**: demote the only admin -> `LAST_ADMIN`.
7. **Search**: `select * from search_available_room_types(current_date, current_date+2, 2)` -> 3 rows (6/8/2). After creating bookings, `sisa_kamar` decreases accordingly. A booking for `[d, d+2)` does not reduce availability for `[d+2, d+4)`.

## 3. Concurrency test script (`scripts/test-concurrency.ts`)

Goal: prove no double booking under parallel requests.
1. Using the service-role client: set all Suite rooms except one to `perawatan` (so exactly one Suite is free). Create 2 test users (or use two existing).
2. Sign in as each user with separate clients. Fire `create_booking` for the same Suite and dates from both clients at the same time with `Promise.all`, repeat 20 rounds (cancel the winner after each round).
3. Expected every round: exactly **one** success and **one** `NO_ROOM_AVAILABLE`. Never two successes.
4. Restore room statuses afterwards. Print a summary table.

## 4. RLS / security tests (manual or script; expected result in brackets)

Logged in as normal user A (second user B exists with a booking):
- `from('bookings').select()` returns only A's rows [pass]
- `from('bookings').select().eq('user_id', B)` returns 0 rows [pass]
- `from('profiles').update({ role: 'admin' }).eq('id', A)` fails `FORBIDDEN_ROLE_CHANGE` [pass]
- `from('bookings').insert({...})` fails (no policy) [pass]
- `from('bookings').update({ status: 'dikonfirmasi' })` affects 0 rows / fails [pass]
- `from('payments').insert/update` fails [pass]
- `from('room_types').insert(...)` fails [pass]
- `rpc('report_summary', ...)` fails `FORBIDDEN` [pass]
- Open `/admin` -> 403 page; open `/booking/<B's booking id>` -> 404 [pass]
- `curl -X POST /api/midtrans/notification` with a wrong `signature_key` -> 401 [pass]; with correct signature but unknown `order_id` -> 200, no change [pass]
- `curl /api/cron/expire-bookings` without secret -> 401 [pass]
- Tamper checkout: send `amount` in the create-transaction body -> ignored; charged amount equals the booking total [pass]
- Search the built client bundle: `grep -R "SUPABASE_SERVICE_ROLE_KEY\|MIDTRANS_SERVER_KEY" .next/static` finds nothing [pass]

## 5. Functional test matrix (manual, record pass/fail in FINAL-REPORT)

| ID | Scenario | Expected |
|---|---|---|
| F1 | Register new user | Profile row created with role `user`; redirected; navbar shows name |
| F2 | Login wrong password | Generic error, no crash |
| F3 | Forgot password flow | Generic success; link opens reset page; new password works; reused/expired link -> invalid state |
| F4 | Search by dates/guests/type/price/sort | Correct rows; URL reflects filters; refresh keeps them |
| F5 | Search with no results | Empty state with "Ubah Pencarian" |
| F6 | Guest clicks PESAN | Login popup -> login -> returns to the same room/dates |
| F7 | Create booking -> checkout | Pending booking, countdown ~60:00, total correct |
| F8 | Pay with Sandbox (success) | Webhook (or status check) -> `settlement`, booking `dikonfirmasi`, status page "Berhasil", receipt printable |
| F9 | Close popup without paying | Stays on checkout, can pay again, same order reused |
| F10 | Let a booking expire | Status `dibatalkan`, room free again, checkout shows expired state |
| F11 | Cancel pending / cancel confirmed (>= 1 day) / cancel confirmed (today) | allowed / allowed / blocked with message |
| F12 | Admin CRUD room types (with photo), rooms, users | Create, read, update, delete all work; friendly errors for duplicates/FK |
| F13 | Admin booking status flow | `dikonfirmasi -> checked_in -> selesai`; invalid actions hidden |
| F14 | Admin dashboard numbers | Match manual SQL counts |
| F15 | Report + print + PDF + Excel | Identical totals; files open correctly |
| F16 | Contact form | Row in `messages`; success state; honeypot ignored |
| F17 | Non-admin visiting `/admin` | 403 page |
| F18 | 404 page | Styled page with button |

## 6. Responsive and UI QA

Check at 390x844, 768x1024, 1440x900:
- No horizontal page scroll; wide tables scroll inside their container
- Navbar hamburger works, drawer traps focus, ESC closes
- Search bar collapses on mobile; date picker shows 1 month
- Checkout summary collapses above the form on mobile
- Admin sidebar becomes a drawer < 1024px
- Touch targets >= 44px; text >= 14px on mobile
- No rounded corners/cards drift from the design; fonts loaded (Cormorant + Jost)
- Keyboard: tab order logical, visible gold focus ring, dialogs accessible
- `prefers-reduced-motion` disables animations
Run Lighthouse on `/`, `/kamar`, `/login`: Accessibility >= 90, Best Practices >= 90.

## 7. Build gates (must all pass before the final commit)

```
npx tsc --noEmit
npm run lint
npm run test
npm run build
```
Also: no `console.log` left in production code, no unused dependencies (`npx depcheck` optional), no files > 1 MB committed accidentally.

## 8. Exam demo script (5-7 minutes, put in FINAL-REPORT)

1. Architecture: Next.js + Supabase + Midtrans; roles; RLS (30 s)
2. Guest: landing -> search -> detail (60 s)
3. Register/login (show bcrypt hash in Supabase `auth.users`) (45 s)
4. Book -> checkout -> Midtrans sandbox pay -> success -> print proof (90 s)
5. Security: try as user to open `/admin` (403); show prepared statement/validation: submit `' OR 1=1 --` and `<script>` strings; show RLS blocking role change (60 s)
6. Double booking: show exclusion constraint rejecting overlap, run the concurrency script (60 s)
7. Admin: dashboard, CRUD, booking status, report -> print/PDF/Excel (90 s)
8. Responsive: resize to mobile (20 s)
