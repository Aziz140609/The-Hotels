# 10 - Task Plan (follow this order, one milestone at a time)

After every milestone: run `npx tsc --noEmit`, `npm run lint`, `npm run build` (and `npm run test` once tests exist). Fix everything, tick the boxes below, then commit:
`git add -A && git commit -m "<message>"`. Do not push. Do not skip ahead. If blocked by a missing secret/value, write it in `docs/ASSUMPTIONS.md`, use a safe placeholder, and continue.

## M0 - Project bootstrap
- [x] `npx create-next-app@latest` (TypeScript, Tailwind, App Router, `src/` dir, ESLint, no Turbopack-specific hacks)
- [x] Install deps listed in `AGENTS.md` section 3; commit `package-lock.json`
- [x] `.gitignore` (see `docs/06` section 12), `.env.example`, `lib/env.ts` (Zod env validation)
- [x] Folder structure from `AGENTS.md` section 6; `design/INDEX.md` after extracting the Stitch zip
- Commit: `chore: bootstrap project`

## M1 - Design system and layouts (`docs/01` steps A-C)
- [x] `globals.css`, Tailwind tokens, fonts via `next/font`
- [x] UI primitives, `PublicNavbar`, `PublicFooter`, `MobileDrawer`, `AdminSidebar/Topbar`, `SplitAuthLayout`
- [x] Temporary `/dev/ui` page showing all primitives (delete in M14)
- Commit: `feat(ui): design system and layouts`

## M2 - Public pages with static data (`docs/01` step D)
- [x] Landing, Ruangan (+ empty state), Detail Kamar (+ lightbox), About, Contact, 404/403
- [x] Login, Register, Lupa Password, Reset Password pages (UI only)
- [x] Responsive at 390/768/1440
- Commit: `feat(ui): public and auth pages (static)`

## M3 - Database
- [x] Tell the user to run `supabase/schema.sql` in the Supabase SQL Editor (you cannot do it yourself); wait for confirmation or continue with typed assumptions
- [x] `src/types/database.ts`; `lib/supabase/{client,server,admin}.ts`; request interceptor with session refresh
- [x] Self-check queries from `docs/02` section 8 run successfully (via a temporary script or the user)
- Commit: `feat(db): supabase clients and types`

## M4 - Authentication and roles
- [x] Sign up, sign in, sign out, forgot/reset password, `/api/auth/callback`
- [x] `requireUser()`, `requireAdmin()`, safe `next` redirect sanitizer, role-based redirects
- [x] Interceptor protecting `/admin`, `/akun`, `/booking`; 403 page for non-admin
- [x] Profile page: update profile, change password (re-auth)
- [ ] Unit tests: validators, `mapError`, redirect sanitizer  (deferred: test runner added later)
- Commit: `feat(auth): login, register, roles and route protection`

## M5 - Room search (read paths)
- [x] `searchParamsSchema`, `search_available_room_types` wiring on `/kamar`
- [ ] Landing room types and room count from DB; detail page by room type id; date picker; login-required popup
- [x] Loading/empty/error states
- Commit: `feat(rooms): search and detail with live data`

## M6 - Booking creation and checkout
- [x] `createBooking` action (duplicate guard, rpc, error mapping), redirect to checkout
- [x] Checkout page: guest form (`updateBookingGuest`), summary, countdown, expired state
- [x] Lazy expiry, `/api/cron/expire-bookings`
- Commit: `feat(booking): create booking and checkout`

## M7 - Midtrans payment
- [x] `lib/midtrans.ts`, create-transaction route, Snap button, webhook, status endpoint, status page (3 states), `applyMidtransStatus`
- [ ] Unit tests for signature/rank/effects  (deferred: test runner added later)
- [ ] Manual sandbox test F8-F10 (tell the user how to run a tunnel and set the Notification URL)
- Commit: `feat(payment): midtrans sandbox integration`

## M8 - User booking history
- [x] `/akun/booking` list/search/filter/pagination, detail (link to status page), cancel flow (+ Midtrans cancel), resume payment
- [x] `/booking/[id]/bukti` printable proof
- Commit: `feat(account): booking history, cancel, proof`

## M9 - Admin: dashboard
- [x] Stats, revenue chart (7/30 days; SVG in gold), recent bookings, occupancy by type
- Commit: `feat(admin): dashboard`

## M10 - Admin: CRUD
- [x] Tipe kamar (dialog form, photo upload to Storage, delete with FK message)
- [x] Kamar (maintenance warning), Pengguna (create/edit/delete via service role, self-protection)
- [x] Booking management (search/filter, valid status actions, detail panel, delete cancelled)
- [x] Shared `ConfirmDialog`, tables with search/pagination, all error mappings
- Commit: `feat(admin): crud for room types, rooms, users, bookings`

## M11 - Reports
- [x] `/admin/laporan` filters + summary + table; print route; PDF export; Excel export route (`docs/08`)
- Commit: `feat(admin): reports with print, pdf and excel`

## M12 - Contact form and remaining pages
- [x] `submitContact` (honeypot, rate limit, service-role insert), success state; About and static content polish
- Commit: `feat(contact): contact form`

## M13 - Hardening
- [ ] Security headers/CSP, rate limiter, `grep` for secrets in client bundle, `npm audit --omit=dev`
- [ ] Walk through every item of `docs/06` section 14 and `docs/05` section 9; fix gaps
- Commit: `chore(security): headers, rate limits, audit`

## M14 - QA and delivery
- [ ] Run all tests in `docs/09` (unit, DB, concurrency, RLS, functional matrix, responsive); record results
- [ ] Delete `/dev/ui` and any temporary scripts not needed; remove unused code/deps
- [ ] Write `README.md` (setup, env vars, how to run, Supabase steps, Midtrans tunnel steps, admin bootstrap) and `docs/FINAL-REPORT.md` (+ demo script from `docs/09` section 8)
- [ ] Final gates: `tsc`, `lint`, `test`, `build` all green
- Commit: `docs: final report and readme`

## Reporting format after each milestone (keep it short)
```
Milestone: Mx - <name>
Done: <bullets>
Verification: tsc OK / lint OK / build OK / tests N passed
Assumptions or deviations: <none or list>
Needs from user: <none or exact action>
Next: Mx+1
```
