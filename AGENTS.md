# AGENTS.md - The Hotels (Hotel Booking Website)

> READ THIS FILE FIRST, then read every file in `/docs` in numeric order before writing code.
> You are an autonomous coding agent. Work in small milestones, verify each one, and never guess silently.

## 1. Project summary

**The Hotels** is a hotel room booking website for ONE hotel (final exam project, Indonesia).
Visitors browse rooms, register/login, book a room for a date range, and pay via **Midtrans Snap (Sandbox / fake payment)**.
Admins manage room types, rooms, bookings, users, and print/export reports.

- UI language: **Indonesian** (all visible text). Code, comments, commit messages, variable names: **English**.
- Currency: IDR (Rupiah), formatted `Rp1.000.000` (use `Intl.NumberFormat('id-ID')`).
- Timezone: **Asia/Jakarta** for every business date.
- Design style: luxury, minimalist, deep emerald + champagne gold, sharp corners, almost no cards. See `docs/01-UI-GENERATION.md`.

## 2. Mandatory exam requirements (acceptance criteria)

| # | Requirement | Where it is satisfied |
|---|---|---|
| 1 | Next.js + Supabase | whole stack |
| 2 | Git + GitHub | commit per milestone (user pushes) |
| 3 | Login, 2 roles (admin, user), full CRUD, search | Supabase Auth + `profiles.role`; CRUD on room_types, rooms, bookings, users; search on rooms and bookings |
| 4 | Printable / exportable report (PDF/Excel) | `/admin/laporan`, see `docs/08-REPORTS-EXPORT.md` |
| 5 | Security basics: hashed passwords, prepared statements, input validation | Supabase Auth (bcrypt), supabase-js parameterized queries/RPC, Zod + DB constraints, see `docs/06-SECURITY.md` |
| 6 | Responsive UI | Tailwind mobile-first, test 390px / 768px / 1440px |

Do not finish until every row is demonstrably working (see `docs/09-TESTING-QA.md`).

## 3. Tech stack (fixed, do not swap)

- **Next.js** latest stable, App Router, TypeScript (strict). Check the installed version in `package.json`:
  if Next >= 16 the request interceptor file is `proxy.ts`; if Next <= 15 it is `middleware.ts`. Use the one that matches.
- **Tailwind CSS** (version created by `create-next-app`), `next/font` for fonts, `lucide-react` icons.
- **Supabase**: `@supabase/supabase-js`, `@supabase/ssr`. Postgres + Auth + Storage.
- **Validation**: `zod`, `react-hook-form`, `@hookform/resolvers`.
- **Payment**: `midtrans-client` (Snap, Sandbox).
- **Reports**: `jspdf` + `jspdf-autotable` (PDF), `exceljs` (Excel), CSS `@media print` (print).
- **Dates**: `date-fns` (+ `date-fns/locale/id`). Never use raw `new Date()` math for stay length; see `docs/04`.
- Optional UI: `sonner` (toasts), `react-day-picker` (date range picker), `@radix-ui/*` primitives (dialogs/dropdowns).
- Do NOT add: ORMs (Prisma/Drizzle), other auth libraries, other CSS frameworks, other payment SDKs.

## 4. Documentation index (read in order)

| File | Purpose |
|---|---|
| `docs/01-UI-GENERATION.md` | Convert the Stitch design export (zip) into Next.js pages/components |
| `docs/02-DATABASE.md` | Tables, rules, RLS, functions. SQL is in `supabase/schema.sql` |
| `docs/03-FLOW.md` | Routes, user journeys, state machines, access matrix |
| `docs/04-BUSINESS-LOGIC.md` | Pricing, availability, cancellation, expiry, server actions, Zod schemas |
| `docs/05-ERROR-HANDLING.md` | Error taxonomy, DB error mapping, Indonesian messages, edge cases |
| `docs/06-SECURITY.md` | Security rules and checklist |
| `docs/07-MIDTRANS.md` | Midtrans Sandbox integration + webhook |
| `docs/08-REPORTS-EXPORT.md` | Print / PDF / Excel reports |
| `docs/09-TESTING-QA.md` | Test scenarios and definition of done |
| `docs/10-TASK-PLAN.md` | Ordered milestones with checkboxes. **Follow this order.** |

If two documents conflict, the priority is: `06-SECURITY` > `02-DATABASE` > `04-BUSINESS-LOGIC` > `03-FLOW` > the rest > the Stitch design for anything that is not about looks.

## 5. Working rules (important: you may be running on different models through a router)

1. **Do not rely on memory of library APIs.** Before using a library, read its installed version in `package.json` and check its types in `node_modules` or its README. If unsure, write the smallest possible test.
2. **One milestone at a time** (`docs/10-TASK-PLAN.md`). After each milestone run, and fix until all pass:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run build`
   Then tick the checkbox in `docs/10-TASK-PLAN.md`, and `git add -A && git commit -m "<conventional message>"`. Never `git push` (the user handles GitHub).
3. **Never invent database objects.** Tables, columns, functions and enum values come only from `supabase/schema.sql`. If you need a change, edit `schema.sql` (append a migration comment), tell the user to re-run it, and update `docs/02-DATABASE.md`.
4. **Never hard-code secrets.** Use environment variables only (see section 7). Never print or log secret values.
5. **Server is the source of truth.** Prices, availability, roles, payment status are computed/verified on the server or in the database. Never trust values sent from the browser.
6. **Every user-facing mutation** must: validate with Zod, check auth/role, call Supabase, map errors with `docs/05`, and return `ActionResult` (never throw raw errors to the UI).
7. **Every page** must have: loading state, empty state, error state, mobile layout.
8. **Keep it simple.** No premature abstractions, no unused dependencies, no dead code, no TODO left behind without a note in the final report.
9. If a requirement is ambiguous, pick the most conservative/secure option, write the assumption in `docs/ASSUMPTIONS.md`, and continue. Do not stop to ask unless blocked by a missing secret.
10. When finished, produce `docs/FINAL-REPORT.md`: what was built, how to run, env vars, test results, known limitations.

## 6. Project structure (target)

```
/
├─ AGENTS.md
├─ docs/                      (these files)
├─ design/                    (Stitch export zip extracted here, read-only reference)
├─ supabase/schema.sql
├─ public/images/             (placeholder photos)
├─ src/
│  ├─ app/
│  │  ├─ (public)/            page.tsx (landing), kamar/, about/, contact/
│  │  ├─ (auth)/              login/, register/, lupa-password/, reset-password/
│  │  ├─ (user)/              booking/[id]/, booking/[id]/status/, akun/booking/, akun/profil/
│  │  ├─ admin/               dashboard + tipe-kamar, kamar, booking, pengguna, laporan
│  │  ├─ api/                 midtrans/notification/, midtrans/create-transaction/, cron/expire-bookings/, auth/callback/
│  │  ├─ not-found.tsx, forbidden.tsx, error.tsx, global-error.tsx
│  ├─ components/ui/          design-system primitives (Button, Input, Label, Dialog, Table, Badge...)
│  ├─ components/layout/      PublicNavbar, PublicFooter, AdminSidebar, MobileDrawer
│  ├─ components/features/    room-search, room-row, booking-form, booking-table, report-table...
│  ├─ lib/supabase/           client.ts, server.ts, admin.ts (service role, server only), middleware helper
│  ├─ lib/validators/         zod schemas
│  ├─ lib/errors.ts           error mapping (docs/05)
│  ├─ lib/constants.ts        business constants (docs/04)
│  ├─ lib/format.ts           rupiah/date formatting
│  ├─ lib/actions/            server actions grouped by domain
│  └─ types/                  generated/handwritten DB types
├─ .env.example
└─ .gitignore                 (must include .env*, node_modules, .next, design/ optional)
```

## 7. Environment variables (`.env.example` must list all, with empty values)

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=           # or the "publishable" key if the project uses new API keys
SUPABASE_SERVICE_ROLE_KEY=               # or the "secret" key. SERVER ONLY. Never NEXT_PUBLIC_
MIDTRANS_SERVER_KEY=                     # Sandbox server key. SERVER ONLY
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=         # Sandbox client key
MIDTRANS_IS_PRODUCTION=false
CRON_SECRET=                             # long random string for /api/cron/*
```
Add `.env.local` to `.gitignore` BEFORE the first commit. Validate env vars at startup with Zod in `lib/env.ts` and fail loudly with a clear message.

## 8. Definition of done (global)

- All 34 screens from the design exist, responsive, in the emerald/gold style.
- All flows in `docs/03-FLOW.md` work end to end with Midtrans Sandbox.
- Double booking is impossible (proved by the concurrency test in `docs/09`).
- A normal user cannot reach `/admin`, cannot change their role, cannot read other users' bookings (proved by tests in `docs/09`).
- Reports print and export to PDF and Excel with correct totals.
- `tsc`, `lint`, `build` pass with zero errors. No `console.log` of sensitive data. No secrets in git history.
- `docs/FINAL-REPORT.md` written.
