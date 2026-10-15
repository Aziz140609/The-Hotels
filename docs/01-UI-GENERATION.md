# 01 - UI Generation (Stitch export -> Next.js)

Goal: turn the Stitch design export into a pixel-faithful, responsive, accessible Next.js UI **without** changing the business logic defined in the other docs.

## 1. Inputs

The user provides a zip from Stitch. Extract it to `/design` (read-only reference, do not edit).
A Stitch export usually contains, per screen, an HTML file (often `code.html`) and a screenshot (`screen.png`). Layout may differ; discover it yourself:

```bash
find design -type f | sort
```

Create `design/INDEX.md` listing every screen found: folder name, title, which screen number (table in section 4) it matches, and whether a desktop and/or mobile variant exists. If a screen from section 4 is missing, build it from the Design System (section 2) and the descriptions in this file, and note it in `docs/ASSUMPTIONS.md`.

## 2. Design system (source of truth if Stitch output is inconsistent)

### Colors (define as CSS variables AND Tailwind theme tokens)

| Token | Hex | Use |
|---|---|---|
| `emerald-900` / `--c-primary` | `#0B2B26` | primary dark background, sidebar, navbar solid |
| `emerald-800` / `--c-secondary` | `#123D35` | alternate dark sections |
| `emerald-950` / `--c-deep` | `#08201C` | footer |
| `ivory` / `--c-ivory` | `#F5F0E6` | light sections, text on dark |
| `gold` / `--c-gold` | `#C9A96E` | accent: thin lines, labels, buttons, hover |
| `danger` | `#B5544B` | errors, cancel only |
| `success` | soft green (pick one, e.g. `#6FA287`) | status dot only |
| `info` | blue-gray (e.g. `#7C93A8`) | status dot only |
| `muted` | gray (e.g. `#8B8F8C`) | completed / disabled |

If the Stitch HTML uses slightly different hex values, prefer the **Stitch values** (they are the approved look) and update this table in your own notes.

### Typography
- Headings and big numbers: **Cormorant Garamond** (weights 400, 500, 600). Load with `next/font/google`.
- Body, menu, forms, tables: **Jost** (weights 300, 400, 500). Load with `next/font/google`.
- Small labels: Jost, uppercase, `letter-spacing: 0.2em`, gold, 11-12px.
- Never load fonts via a `<link>` to Google; use `next/font` only.

### Shape and style rules
- **Sharp corners everywhere** (`rounded-none`). No shadows except a very subtle one on popups.
- **Almost no cards.** Separate content with thin gold lines (`border-gold/40` 1px), whitespace, and photography.
- Buttons: uppercase, small (12-13px), wide letter spacing. Primary = gold fill with emerald text; secondary = 1px gold outline with gold text; hover = fill transition (150-250ms).
- Inputs: **underline only** (1px gold/50), gold on focus, label above in small gold uppercase, error text in `danger` below.
- Table rows: 1px gold/30 bottom border, hover = very light gold tint (`bg-gold/5`).
- Status = tiny colored dot + text, never colored badges/pills.
- Scroll animation: subtle fade-up (opacity + 12px translate, 500-700ms), respect `prefers-reduced-motion`.

## 3. How to work (strict order)

### Step A - Tokens first
1. Create `src/app/globals.css` with the CSS variables, base styles, font setup, `@media print` base.
2. Create the Tailwind theme extension (colors above, font families `font-serif`=Cormorant, `font-sans`=Jost, letter-spacing helpers, container widths).
3. Do NOT copy Stitch's `<script src="https://cdn.tailwindcss.com">` or inline `tailwind.config`. Port only the values into the real Tailwind setup.

### Step B - Primitives (`src/components/ui`)
Build once, reuse everywhere. Each takes a `className` prop and forwards refs where relevant:

`Button` (variants: primary, outline, ghost/link, danger-outline; sizes: sm, md; `loading` prop with spinner and `disabled`), `Input`, `Textarea`, `Select`, `Label` (gold uppercase), `FieldError`, `FormField` (label + control + error), `Checkbox`, `Dialog/Modal` (focus trap, ESC, overlay click, `aria-modal`), `SlideOver` (right panel), `ConfirmDialog` (title, message, confirm/cancel, `danger` variant), `Table` (thin-line style) + `TableToolbar` + `Pagination`, `StatusDot`, `Toast` (use `sonner` styled to the design), `Skeleton`, `EmptyState` (serif title, small text, optional gold-outline button), `SectionLabel` (gold uppercase label + serif heading), `GoldDivider`, `DateRangePicker` (popup), `PriceText`, `Stepper` (3 steps), `Countdown`.

### Step C - Layout (`src/components/layout`)
`PublicNavbar` (transparent over hero / solid otherwise; logged-in user dropdown; hamburger on mobile), `MobileDrawer`, `PublicFooter`, `AdminSidebar` + `AdminTopbar` (collapses to drawer < 1024px), `SplitAuthLayout` (photo left, form right, used by login/register/forgot/reset).

### Step D - Pages with STATIC mock data
Build every page from section 4 using the primitives and static data so the UI can be reviewed before wiring. Match the screenshot first; then adapt to mobile (390px) and tablet (768px).

### Step E - Wire real data
Replace mock data with real queries/actions per `docs/03` and `docs/04`. Keep component props typed (`type RoomTypeCard = {...}`) so wiring does not require UI changes.

## 4. Screen -> route map (34 screens)

| # | Screen | Route / host | Notes |
|---|---|---|---|
| 1 | Landing page | `/` | Hero, About, Tipe Kamar (3 from DB), Fasilitas, Cara Booking, Lokasi (map), Footer |
| 2 | Ruangan (search) | `/kamar` | Search bar -> URL query params; result rows alternating photo side; empty state frame |
| 3 | Detail kamar | `/kamar/[id]` | `[id]` = room type id. Gallery + sticky booking summary |
| 4 | About Us | `/about` | |
| 5 | Contact | `/contact` | Form -> `messages` table via server action; success frame |
| 6 | Login | `/login` | Error frame |
| 7 | Register | `/register` | Validation error frame |
| 8 | Error pages | `not-found.tsx` (404), `forbidden.tsx` or `/403` (403) | Deep emerald full screen |
| 9 | Checkout | `/booking/[id]` | `[id]` = booking id. Countdown from `expired_at` |
| 10 | Status pembayaran | `/booking/[id]/status` | 3 states: berhasil, menunggu, gagal |
| 11 | Riwayat booking | `/akun/booking` | Search, filter, pagination, empty frame |
| 12 | Profil | `/akun/profil` | Update profile + change password |
| 13 | Admin Dashboard | `/admin` | Stats, revenue chart, recent bookings, occupancy by type |
| 14 | Admin Tipe Kamar | `/admin/tipe-kamar` | CRUD |
| 15 | Admin Kamar | `/admin/kamar` | CRUD |
| 16 | Admin Booking | `/admin/booking` | Search/filter, status change, detail panel |
| 17 | Admin Pengguna | `/admin/pengguna` | CRUD + role |
| 18 | Admin Laporan | `/admin/laporan` | Filter, print, export |
| 19 | Popup wajib login | modal on `/kamar` and `/kamar/[id]` | Opens when guest clicks Pesan |
| 20 | Date range picker | popup in search bar and detail page | |
| 21 | Detail booking (user) | modal on `/akun/booking` | |
| 22 | Konfirmasi batalkan (user) | `ConfirmDialog` | |
| 23 | Form tipe kamar | slide-over on `/admin/tipe-kamar` | Add/edit |
| 24 | Konfirmasi hapus | `ConfirmDialog` (danger) | Used by all admin delete actions |
| 25 | Form kamar | modal on `/admin/kamar` | Add/edit |
| 26 | Edit pengguna | modal on `/admin/pengguna` | |
| 27 | Konfirmasi ubah status | `ConfirmDialog` | Normal + cancel variant |
| 28 | Toast | global | success / error / info / warning |
| 29 | Lightbox galeri | on `/kamar/[id]` | Keyboard: arrows, ESC |
| 30 | Mobile menu drawer | `MobileDrawer` | Guest and logged-in variants |
| 31 | Lupa password | `/lupa-password` | Success frame |
| 32 | Reset password | `/reset-password` | Success + invalid-link frames |
| 33 | Bukti booking (print) | `/booking/[id]/bukti` | White A4 layout, print CSS, QR placeholder |
| 34 | Form tambah pengguna | modal on `/admin/pengguna` | Same as edit + password |

Route groups `(public)`, `(auth)`, `(user)` and the `admin` segment each get their own layout file.

## 5. Conversion rules (Stitch HTML -> React)

1. Treat the **screenshot as the visual truth**; treat the HTML as a hint for structure/classes. If they disagree, follow the screenshot.
2. Convert markup to semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, real `<button>` and `<a>` (never clickable `<div>`), `<table>` with `<th scope>`, `<label for>`.
3. Replace remote image URLs from Stitch with local placeholders in `public/images/` (see section 7) and render with `next/image` (`alt` required, `sizes` set, `priority` only for the hero).
4. Replace Stitch icon fonts/SVG sprites with `lucide-react` icons (thin stroke: `strokeWidth={1.25}`), gold colored.
5. Use **Server Components by default**. Add `"use client"` only for: navbar scroll/dropdown, mobile drawer, date picker, forms, modals, charts, toasts, countdown, lightbox.
6. No inline styles except for dynamic values. No `!important`. No arbitrary magic numbers repeated more than twice (make a token).
7. Responsive breakpoints: mobile-first; verify 390, 768, 1024, 1440. No horizontal page scroll. Wide tables scroll inside `overflow-x-auto`.
8. Admin tables below 768px: keep the table inside a horizontal scroller (do not rebuild as cards).
9. Public pages: tables on user pages (`/akun/booking`) become stacked lists with thin gold dividers on mobile.
10. Accessibility: visible focus ring (gold), color contrast >= 4.5:1 for body text (ivory on emerald and emerald on ivory pass), `aria-label` on icon buttons, dialogs trap focus and restore it, `aria-live="polite"` for toasts and countdown warnings.
11. Do not hardcode business data in JSX (prices, room names, counts). They come from the database. Static copy (headings, descriptions) is fine.
12. Landing numbers ("50 Kamar", etc.): show real room count from DB; the other two figures stay static text.

## 6. Interactive behaviors to implement exactly

- **Navbar**: transparent at top of landing, becomes solid emerald after 40px scroll; active link has gold underline; user dropdown = Booking Saya, Profil, Keluar (admin sees an extra "Dashboard Admin").
- **Room result row**: image hover zoom 1.04 (600ms), gold line extends under row.
- **Search bar**: submitting updates the URL (`?checkin=2026-10-20&checkout=2026-10-22&guests=2&type=2&price=lt500&sort=asc`) so results are shareable and refresh-safe. Defaults: check-in today, check-out tomorrow, guests 1.
- **Date picker**: disables past dates; shows 2 months on desktop, 1 on mobile; shows "N malam"; fully booked dates are disabled only on the detail page (where the room type is known); min stay 1 night, max 30.
- **Checkout countdown**: counts down to `expired_at`; at 5 minutes remaining show a warning toast once; at 0 disable the pay button and switch the page to the "gagal/kedaluwarsa" state after confirming with the server.
- **Lightbox**: ESC closes, left/right arrows navigate, focus trapped, body scroll locked.
- **Toasts**: top-right desktop, top-center mobile, auto dismiss 4s (errors 6s), max 3 visible.
- **Confirm dialogs**: destructive button never focused by default; focus starts on Cancel.
- **Forms**: submit button shows loading and is disabled while pending; on server error keep the typed values.
- **Print pages** (`/booking/[id]/bukti`, report): `@media print` hides navbar/sidebar/buttons, white background, black text, gold hairlines in `#C9A96E`, `@page { size: A4; margin: 16mm }`.

## 7. Images

Create `public/images/` with placeholder JPGs/SVGs named by role: `hero.jpg`, `lobby.jpg`, `room-standard.jpg`, `room-deluxe.jpg`, `room-suite.jpg`, `gallery-1..5.jpg`, `about-1..4.jpg`. If real photos are not provided, generate neutral dark-emerald gradient placeholder SVGs with the role name in small gold text so the layout is reviewable. Room type photos in production come from Supabase Storage (`room-photos` bucket) via `foto_url`; fall back to the placeholder when null. Configure `next.config` `images.remotePatterns` for the Supabase storage host only.

## 8. Maps

Embed Google Maps via `<iframe>` (no API key) with `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`, and a CSS filter (`grayscale(1) contrast(1.1)` plus an emerald multiply overlay) to match the muted look. Address placeholder: Jl. Contoh No. 1, Surakarta, Jawa Tengah. Keep the address and coordinates in `lib/constants.ts` so the user can change them in one place.

## 9. UI done checklist

- [ ] Tokens, fonts, primitives, layouts built; storybook not required but each primitive demonstrated on a temporary `/dev/ui` page (delete before final)
- [ ] All 34 screens built and matched to the screenshots at 1440px
- [ ] All screens usable at 390px and 768px
- [ ] No rounded corners, no heavy shadows, no card grids anywhere
- [ ] Lighthouse accessibility >= 90 on `/`, `/kamar`, `/login`
