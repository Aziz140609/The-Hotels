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

### M4 - Authentication and roles
- lib/actions/auth.ts (signIn, signUp, signOut, requestPasswordReset, resetPassword, updateProfile, changePassword)
- Login/Register/Forgot/Reset client forms wired to server actions
- AccountMenu + auth-aware PublicNavbar/MobileDrawer/PublicShell
- /akun/profil page (profile + change password)
- proxy.ts protects /admin, /akun, /booking; forbidden() boundary for non-admin
- getSessionUser() helper, authInterrupts enabled
- tsc OK / lint OK / build OK
- (unit tests deferred until test runner is added)

### M6 - Booking creation & checkout
- lib/actions/bookings.ts (createBooking, updateBookingGuest, cancelBooking)
- /booking/[id] checkout page + BookingCheckout (guest form, summary, countdown, expired state)
- /api/booking/[id]/guest (save guest data)
- lib/midtrans.ts (Snap/CoreApi factory + signature verify)
- /api/midtrans/create-transaction (idempotent snap token)
- components/features/pay-button.tsx (Snap script + popup)
- types/snap.d.ts

### M7 - Midtrans payment
- lib/payments/apply-status.ts (rank guard + booking effects)
- /api/midtrans/notification (signature verify + server-side status check)
- /api/midtrans/status (ownership + stale check)
- /booking/[id]/status page + BookingStatusView (3 states, polling 3s/2m)
- tsc OK / lint OK / build OK
- (unit tests + manual sandbox test pending)

### M8 - User booking history
- /akun/booking list with search (kode), status filter, pagination (10/page)
- cancel flow (server-side guard + Midtrans cancel best effort), resume payment
- /booking/[id]/bukti printable proof + PrintButton
- live /kamar/[id] detail page with BookingForm wired to createBooking
- tsc OK / lint OK / build OK

### M12 - Contact form
- lib/actions/contact.ts (honeypot, IP rate limit 5/min, service-role insert into messages)
- /contact ContactForm client (validation, success state, toast errors)
- tsc OK / lint OK / build OK

### M9 - Admin dashboard
- /admin layout (requireAdmin guard) + AdminShell + sidebar (added Kamar link)
- admin_dashboard_stats, admin_revenue_series, admin_room_type_occupancy_today RPCs typed
- revenue-chart.tsx (hand-made SVG, 7/30 day toggle), admin-occupancy.tsx, recent bookings table
- tsc OK / lint OK / build OK

### M10 - Admin CRUD
- Tipe kamar: admin-room-types.ts actions (create/update/delete, photo upload to `room-photos`), /admin/tipe-kamar + RoomTypeManager (dialog form, facility tags, search)
- Kamar: admin-rooms.ts actions, /admin/kamar + RoomManager (type/status filters, maintenance warning, delete guard)
- Booking: admin-bookings.ts actions (status transitions, note, delete only dibatalkan), /admin/booking + BookingTable (search/date/status filters, detail dialog, pagination)
- Pengguna: admin-users.ts actions (service-role create/edit/delete, self-protection), /admin/pengguna + UserManager
- next.config images.remotePatterns for supabase storage
- tsc OK / lint OK / build OK

## NOT DONE

- M5  - Remaining: landing room types + count from DB, login-required popup
- M7  - Remaining: unit tests, manual sandbox test (needs Midtrans keys + tunnel)
- M11 - Reports (print/PDF/Excel)
- M13 - Hardening (CSP, rate limits, audit)
- M14 - QA + FINAL-REPORT + README

## USER RULES
1. Setiap pembuatan sesuatu -> commit ke git dulu
2. Satu sesi minimal 20 commit (lebih banyak lebih bagus)
3. Jangan push ke GitHub (user handle sendiri)
4. Satu milestone satu waktu, verifikasi tsc/lint/build sebelum lanjut

## CURRENT STATE
- Done: M0-M4, M5 (partial), M6-M9, M12
- Next action: M10 - admin CRUD (tipe kamar, kamar, pengguna, booking)
