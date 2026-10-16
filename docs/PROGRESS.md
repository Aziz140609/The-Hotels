# Progress Report

## DONE

### M0 - Project Bootstrap
- Next.js 16 + TS + Tailwind 4 + App Router
- All deps installed (supabase, zod, midtrans, jspdf, exceljs, etc.)
- .gitignore, .env.example, lib/env.ts
- Folder structure per AGENTS.md
- design/INDEX.md (18 Stitch screens mapped)

### M1 - Design System & Layouts
- globals.css + Tailwind tokens + fonts (EB Garamond + DM Sans)
- UI primitives: Button, Input, Textarea, Select, Label, FieldError,
  FormField, Checkbox, Dialog (Radix), ConfirmDialog, SlideOver,
  Table, Pagination, StatusDot, Skeleton, EmptyState, SectionLabel,
  GoldDivider, DateRangePicker, PriceText, Stepper, Countdown, Toast
- Layout: PublicNavbar, MobileDrawer, PublicFooter, PublicShell,
  AdminSidebar, AdminTopbar, AdminShell, SplitAuthLayout
- /dev/ui demo page
- Route group layouts: (public), (auth), (user)
- Root loading.tsx + error.tsx

### M2 - Public Pages Static
- Landing page, /kamar, /kamar/[id], about, contact
- Login, register, lupa-password, reset-password (UI only)
- 404 and 403 pages
- 14 placeholder SVG images in public/images/

### M3 - Database
- src/types/database.ts, lib/supabase/{client,server,admin}.ts
- proxy.ts session refresh + route guard
- lib/errors.ts (mapError, ActionResult), lib/auth.ts (requireUser/requireAdmin)
- lib/validators/*, lib/rate-limit.ts, lib/redirect.ts, lib/logger.ts
- /api/auth/callback, /api/cron/expire-bookings

### M5 - Room search (partial)
- searchRoomTypes server action (search_available_room_types RPC)
- /kamar page + SearchForm + KamarResults

### M6 - Booking creation & checkout
- lib/actions/bookings.ts (createBooking, updateBookingGuest, cancelBooking)
- /booking/[id] checkout page + BookingCheckout (guest form, summary, countdown, expired state)
- /api/booking/[id]/guest (save guest data)
- lib/midtrans.ts (Snap/CoreApi factory + signature verify)
- /api/midtrans/create-transaction (idempotent snap token)
- components/features/pay-button.tsx (Snap script + popup)
- types/snap.d.ts
- tsc OK / lint OK / build OK

## NOT DONE

- M4  - Authentication wiring (server actions, forms, profile) + role protection  [NEXT]
- M5  - Remaining: landing room types + count from DB, detail page by id live data, login-required popup
- M7  - Midtrans: webhook /api/midtrans/notification, status API, status page, applyMidtransStatus
- M8  - User booking history + cancel + proof
- M9  - Admin dashboard
- M10 - Admin CRUD (tipe kamar, kamar, pengguna, booking)
- M11 - Reports (print/PDF/Excel)
- M12 - Contact form
- M13 - Hardening (CSP, rate limits, audit)
- M14 - QA + FINAL-REPORT + README

## USER RULES
1. Setiap pembuatan sesuatu -> commit ke git dulu
2. Satu sesi minimal 20 commit (lebih banyak lebih bagus)
3. Jangan push ke GitHub (user handle sendiri)
4. Satu milestone satu waktu, verifikasi tsc/lint/build sebelum lanjut

## CURRENT STATE
- Working tree: M6 changes staged next
- Next action: commit M6, then implement M4 (auth wiring)
