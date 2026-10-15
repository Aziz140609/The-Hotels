# Progress Report

## DONE

### M0 - Project Bootstrap
- Next.js 16 + TS + Tailwind 4 + App Router
- All deps installed (supabase, zod, midtrans, jspdf, exceljs, etc.)
- .gitignore, .env.example, lib/env.ts
- Folder structure per AGENTS.md
- design/INDEX.md (18 Stitch screens mapped)

### M2 - Public Pages Static (placeholder data)
- Landing page with hero, about, room types, facilities, booking steps, location
- Room search page with mock room cards and detail page
- About, Contact, Login, Register, Forgot Password, Reset Password pages
- 404 and 403 error pages
- 14 placeholder SVG images in public/images/

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
- tsc OK / lint OK / build OK

## NOT DONE

- M2  - Public pages static (Landing, Kamar, Detail, About, Contact, Auth, 404/403)
- M3  - Database types + Supabase clients + interceptor
- M4  - Authentication (login/register/forgot/reset) + roles + route protection
- M5  - Room search with live DB data
- M6  - Booking creation + checkout
- M7  - Midtrans payment integration
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
- Commits this session: 26
- Working tree: clean
- Next action: M2 (public pages with static data)
