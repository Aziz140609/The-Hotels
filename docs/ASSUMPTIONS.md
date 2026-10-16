# Assumptions

1. **Fonts**: Stitch export uses EB Garamond + DM Sans. docs/01 specifies Cormorant Garamond + Jost. Per docs/01 §2: "prefer the Stitch values" — using **EB Garamond** (serif) and **DM Sans** (sans) as the Stitch design intended.

2. **Email confirmation**: Turned off in development (Supabase Auth > Settings). Noted per docs/02.

3. **Midtrans webhook**: Requires a public URL (tunnel) for localhost development. Will document the setup steps.

4. **CSP**: Enforced directly (not report-only) with `'unsafe-inline'` for scripts/styles because Next.js hydration needs inline scripts without a nonce setup. `'unsafe-eval'` is added in development only. If the Snap popup or map embed is blocked, add the failing domain to `frame-src`/`connect-src`.

5. **Rate limits**: In-memory sliding window (`lib/rate-limit.ts`) keyed by IP or user id; per-instance only (resets on deploy/restart). Limits: login 10/5min IP, register 10/hour IP, contact 5/hour IP, create-transaction 10/10min user, status poll 60/10min user.

6. **`uuid` advisory (moderate)**: transitive via `exceljs`; `npm audit --omit=dev` reports 2 moderate issues. Auto-fix downgrades exceljs to 3.4.0 (breaking), so left as-is and documented in the final report.

