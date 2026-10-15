# 06 - Security Rules

These rules have the highest priority in the whole project. Exam requirement: **hashed passwords, prepared statements (parameterized queries), input validation**. Everything below also protects against the usual web attacks.

## 1. The exam trio (be able to demonstrate each)

| Requirement | How it is met | How to demonstrate |
|---|---|---|
| Password hashing | Passwords are handled only by Supabase Auth (bcrypt). The app has no password column and never stores or logs a password. | Show `auth.users.encrypted_password` in the Supabase dashboard (hash, not plain text) and show that `profiles` has no password column. |
| Prepared statements | All data access uses `supabase-js` (PostgREST/RPC with bound parameters). No SQL is ever built from strings in the app. The SQL in `schema.sql` uses parameters (`p_*`) only. | Try `' OR 1=1 --` in search/login; it is treated as plain text. Show code: no template-string SQL. |
| Input validation | Zod on client and server for every input + DB `CHECK`/`NOT NULL`/`UNIQUE` constraints + DB functions that re-validate. | Submit invalid data via the UI and via a direct API call; both are rejected. |

## 2. Three Supabase clients (strict separation)

| File | Key | Where it runs | Use |
|---|---|---|---|
| `lib/supabase/client.ts` | anon/publishable | browser | auth state, Storage download URLs; minimal use |
| `lib/supabase/server.ts` | anon/publishable + user cookies | server components, actions, route handlers | **default for everything** (RLS applies as the user) |
| `lib/supabase/admin.ts` | **service role/secret** | server only | webhook updates, cron, contact insert, admin user management. First line `import 'server-only'`. Never imported by a client component. |

Rules: use the service-role client only after you have verified the caller yourself (admin check, signature check, or cron secret). Default to the user-scoped client. Grep before finishing: `SUPABASE_SERVICE_ROLE_KEY` and `MIDTRANS_SERVER_KEY` must appear only in server-only files and `.env*`.

## 3. Authentication and sessions

- Use `@supabase/ssr` cookie sessions. Server-side authorization **always** calls `supabase.auth.getUser()` (verifies the JWT with Auth server). Never trust `getSession()` for access decisions.
- Refresh the session in the request interceptor (`middleware.ts`/`proxy.ts`) using the official `@supabase/ssr` pattern and pass the refreshed cookies on.
- Roles are read from `profiles.role` (database), **never** from `user_metadata` (user-editable) or from a client-provided value.
- Password policy: min 8, max 72, letters + digits. Show/hide toggle; no password in URLs; `autocomplete` attributes set (`current-password`, `new-password`, `email`).
- Change password: re-authenticate with the current password first, then `updateUser`, then sign out other sessions.
- Login failure message is generic. Forgot-password response is identical for existing/non-existing emails.
- Logout is a POST server action (not a GET link).

## 4. Authorization (defense in depth)

1. Interceptor: coarse redirect for `/admin`, `/akun`, `/booking`.
2. Server components/actions: `requireUser()` / `requireAdmin()` at the top of every protected page, action, and route handler (the interceptor alone is NOT enough; it can be bypassed or misconfigured).
3. Database RLS + triggers + `SECURITY DEFINER` function checks (final guard).
4. Ownership checks: every `/booking/[id]/*` page and API verifies `booking.user_id === user.id`; return 404 (not 403) when it does not match to avoid leaking ids.

## 5. Input validation and output encoding

- Validate on the client for UX and **again on the server** (the server copy is the real one). Same Zod schema file shared.
- Reject unknown fields (`.strict()`), trim strings, bound lengths (see `docs/04`).
- Treat route params and search params as untrusted: parse with Zod; invalid -> defaults or 404.
- Output: rely on React escaping. **No `dangerouslySetInnerHTML`** with user data. User text (names, notes, messages) is plain text everywhere, including PDF/Excel/print.
- Filters interpolated into PostgREST `or()`/`ilike` strings must be sanitized (`docs/04` section 11) to prevent filter injection.
- URLs: only allow `next` redirects that are internal relative paths. `foto_url` must start with the project's Supabase Storage origin.

## 6. Money and business-rule integrity

- Price and totals computed in the database (`create_booking`) and re-read from the DB when talking to Midtrans. Never accept `amount`, `total`, `status`, `role`, `user_id`, `room_id` from the client.
- Payment/booking status changes only via verified webhook / server status check / admin actions with valid transitions.
- Direct table writes by users are impossible by design (no RLS insert/update policies on `bookings`, `payments`); only RPCs and the server.

## 7. Webhook and cron endpoints

- `/api/midtrans/notification`: verify `signature_key` = `SHA512(order_id + status_code + gross_amount + ServerKey)` using the **raw string values from the body** (do not reformat `gross_amount`), compare with `crypto.timingSafeEqual`. Then confirm by calling Midtrans status API. Details in `docs/07`.
- `/api/cron/expire-bookings`: require `Authorization: Bearer ${CRON_SECRET}`; compare in constant time; return 401 otherwise.
- Both: accept only `POST` (webhook) / `GET` or `POST` (cron), limit body size (reject > 100 KB), never echo request data in responses.

## 8. CSRF and request origin

- Server Actions: Next.js validates the Origin header; do not disable it. Do not set `allowedOrigins` wider than needed.
- Route handlers that use cookies and mutate state (`create-transaction`, exports): require `POST`, check that `Origin` host equals `NEXT_PUBLIC_SITE_URL` host, and require an authenticated user.
- Cookies: `SameSite=Lax`, `Secure` in production (the Supabase SSR helper sets sensible defaults; do not override to weaker values).

## 9. Security headers (`next.config.ts` `headers()`)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY                         (and CSP frame-ancestors 'none')
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains   (production only)
Content-Security-Policy: see below
```
CSP allow-list (adjust after testing; start with `Content-Security-Policy-Report-Only`, confirm nothing breaks, then enforce):
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com` (+ `'unsafe-eval'` in development only; Next.js needs inline scripts unless you implement nonces)
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: blob: https://*.supabase.co https://*.midtrans.com`
- `font-src 'self'` (fonts come from `next/font`, self-hosted)
- `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.midtrans.com`
- `frame-src https://app.sandbox.midtrans.com https://app.midtrans.com https://www.google.com` (Snap popup iframe and the map embed)
- `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`; `object-src 'none'`
Check Midtrans' documentation for any additional domains if the Snap popup is blocked (look at the browser console CSP errors).

## 10. File upload (room photos)

- Admin only. Validate on client (UX) and in the server action: MIME in allow-list, extension matches, size <= 2 MB, non-empty. Generate the object path yourself (never use the user's file name raw; slugify and add a timestamp). Storage bucket enforces the same limits.
- Strip nothing fancy; do not process SVG (not in allow-list, avoids script-in-SVG).

## 11. Rate limiting and abuse

- Supabase Auth has built-in rate limits for login/signup/reset; surface their 429 nicely.
- Add a small limiter (`lib/rate-limit.ts`, in-memory sliding window keyed by IP + route; document that it is per-instance only) for: contact form (5/hour/IP), create-transaction (10/10min/user), status polling (60/10min/user), register (10/hour/IP).
- Contact form: honeypot field `website`; ignore the submission silently if filled.
- `TOO_MANY_PENDING` (DB) prevents hoarding rooms.

## 12. Secrets, git, dependencies

- `.gitignore` before the first commit: `.env*` (except `.env.example`), `node_modules`, `.next`, `*.log`, `.DS_Store`, `/design` (large exports; optional), `supabase/.temp`.
- `.env.example` has keys with empty values only.
- If a secret is ever committed: tell the user to **rotate it immediately** (Supabase keys, Midtrans keys); removing it from history is not enough.
- Commit `package-lock.json`. Run `npm audit --omit=dev`; fix high/critical issues or document them. Pin direct dependency versions (no `latest`).
- Never `console.log` secrets, tokens, `snap_token`, passwords, or full webhook bodies.

## 13. Privacy

- Collect only what is needed (name, email, phone). Guest data lives in `bookings`; profile data in `profiles`. Show only the current user's data. Admin sees all.
- Do not put email/phone in URLs or analytics.

## 14. Security checklist (verify before finishing; results go to `docs/FINAL-REPORT.md`)

- [ ] No password column anywhere; Auth handles hashing
- [ ] No string-built SQL; all queries via supabase-js/RPC; filter strings sanitized
- [ ] Zod on every action/handler; unknown fields rejected; DB constraints present
- [ ] `getUser()` used for all authorization; roles from `profiles`
- [ ] `requireAdmin()` on every admin page/action/handler; RLS enabled on all 6 tables
- [ ] User cannot change own role (tested), cannot read others' bookings (tested), cannot insert/update `bookings`/`payments` directly (tested)
- [ ] Service-role key and Midtrans server key only in server-only code; not in client bundle (`grep` the `.next/static` output)
- [ ] Webhook signature verified; bad signature -> 401; amount verified
- [ ] Open redirect blocked; IDOR blocked (other user's booking -> 404)
- [ ] Security headers present (check with browser dev tools); CSP does not break Snap or the map
- [ ] Upload validation works; wrong files rejected
- [ ] `.env.local` not tracked by git (`git ls-files | grep env`)
- [ ] `npm audit --omit=dev` reviewed
