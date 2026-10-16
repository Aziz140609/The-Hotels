# Final Report — The Hotels

## 1. What was built

A full-stack hotel booking site for one hotel, Next.js 16 (App Router, TypeScript strict) +
Tailwind CSS 4 + Supabase + Midtrans Snap (Sandbox). UI in Indonesian, emerald/champagne-gold
minimalist style (EB Garamond + DM Sans), mobile-first and responsive.

### Delivered features

| Area | Status |
|---|---|
| Landing, `/kamar` search, `/kamar/[id]` detail, `/about`, `/contact` | done |
| Auth: register, login, logout, forgot/reset password, profile + change password | done |
| Roles: `admin` / `user` from `profiles.role`, guarded by `proxy.ts` + server checks | done |
| Booking: date-range availability (RPC), create booking, guest data, 60-min hold | done |
| Payment: Midtrans Snap create-transaction, Snap popup, webhook, status polling | done |
| User: `/akun/booking` history (search/filter/paginate/cancel), `/booking/[id]/status`, `/booking/[id]/bukti` | done |
| Admin: dashboard (stats, revenue chart, occupancy, recent bookings) | done |
| Admin CRUD: room types (+photo upload), rooms (+maintenance warning), users (service role), bookings (status machine) | done |
| Reports: `/admin/laporan` on-screen, print (A4 landscape), PDF (jspdf), Excel (exceljs) | done |
| Contact form: honeypot + rate limit, service-role insert | done |
| Security: headers, CSP, in-memory rate limits, env validation, RLS + DB constraints | done |

### Database

`supabase/schema.sql` is the single source of truth: 6 tables (`profiles`, `room_types`, `rooms`,
`bookings`, `payments`, `messages`), enum-like checks, an exclusion constraint preventing double
booking, triggers (new-user profile, profile/booking guards, payment amount guard), RLS policies
for all tables and the `room-photos` bucket, business functions (`create_booking`, `cancel_booking`,
`search_available_room_types`, `report_summary`, `admin_dashboard_stats`, `admin_revenue_series`,
`admin_room_type_occupancy_today`), and seed data.

## 2. How to run

See `README.md`. Short version: `npm install`, fill `.env.local`, run `supabase/schema.sql` in the
Supabase SQL Editor, register an account and promote it to admin, then `npm run dev`.

## 3. Environment variables

Listed in `.env.example`. `lib/env.ts` validates them at server start (via `instrumentation.ts`).
Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`) are used only in server-only modules
and are absent from the client bundle (verified by grepping `.next/static`).

## 4. Verified results

Static gates, all green after every milestone:

- `npx tsc --noEmit` — 0 errors
- `npm run lint` — 0 errors / 0 warnings
- `npm run build` — compiled successfully; all routes prerender/compile

Checks performed:

- `.next/static` grep for `SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, `CRON_SECRET`,
  `service_role` → none present in the client bundle.
- `git ls-files | grep env` → only `.env.example` is tracked.
- `npm audit --omit=dev` → 2 moderate advisories (`uuid` via `exceljs`), no high/critical. The
  automated fix would downgrade `exceljs` to 3.4.0 (breaking), so it is left as-is.

### Security checklist (`docs/06` §14)

- No password column anywhere; Supabase Auth hashes credentials.
- No string-built SQL; all access via supabase-js queries/RPC; `or()`/search filter inputs are
  sanitized (`[%,()]` stripped).
- Zod validation on every server action and API handler; DB constraints present.
- `getUser()` used for authorization; roles read from `profiles`.
- Admin routes/actions verify the admin role; RLS enabled on all 6 tables.
- Webhook signature verified (SHA512); amount and status re-verified server-side.
- Open-redirect blocked (`sanitizeRedirect`); other users' bookings return 404.
- Security headers + CSP configured in `next.config.ts`.
- Upload validated (MIME allow-list JPG/PNG/WEBP, ≤ 2 MB, server-generated object path).
- `.env.local` not tracked.

## 5. Known limitations / TODO

- **Manual Midtrans sandbox test pending**: requires real Midtrans keys and a public tunnel URL;
  the webhook and Snap popup could not be exercised without them.
- **Runtime RLS/IDOR/concurrency tests pending**: need a live Supabase project (see `docs/09`).
- **No automated test runner**: Vitest is not installed; `docs/09` scenarios are documented for
  manual execution.
- Rate limiting is in-memory and per-instance only.
- `uuid` moderate advisory documented above.
- `@next/swc-win32-x64-msvc` "not a valid Win32 application" warnings during build are harmless;
  the build falls back to WASM bindings on this machine.
