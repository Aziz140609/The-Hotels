# 07 - Midtrans Snap Integration (Sandbox / fake payment)

Mode: **Sandbox only** (`MIDTRANS_IS_PRODUCTION=false`). Money is simulated. The flow and code must be identical to production except the keys and URLs.

## 1. Setup facts

- Create a free Midtrans account and use the **Sandbox** environment keys (Server Key, Client Key) from the sandbox dashboard (Settings > Access Keys).
- Snap script URL: sandbox `https://app.sandbox.midtrans.com/snap/snap.js`, production `https://app.midtrans.com/snap/snap.js`. Choose by `MIDTRANS_IS_PRODUCTION`. The script tag needs `data-client-key`.
- Webhook (Payment Notification URL): set in the sandbox dashboard (Settings > Configuration) to `https://<public-host>/api/midtrans/notification`. Localhost is not reachable by Midtrans: during development expose it with a tunnel (ngrok or Cloudflare Tunnel) and paste that URL. Document this in the final report.
- Library: `midtrans-client` (CommonJS, may lack TypeScript types: add `src/types/midtrans-client.d.ts` with `declare module 'midtrans-client'`). Check the installed README for exact method names before coding. Expected: `new midtransClient.Snap({ isProduction, serverKey, clientKey })` with `createTransaction(params)` returning `{ token, redirect_url }`; and `new midtransClient.CoreApi({...})` with `transaction.status(orderId)`, `transaction.cancel(orderId)`, `transaction.expire(orderId)`.
- All Midtrans calls happen on the server (`import 'server-only'` in `lib/midtrans.ts`). The server key never reaches the browser.

## 2. Creating a transaction: `POST /api/midtrans/create-transaction`

Body: `{ bookingId: number }` (nothing else is trusted).

Server steps (any failed check returns `ActionResult`-style JSON with a mapped message and the right HTTP status):
1. Origin check, `requireUser()`, rate limit.
2. Load the booking with the **user-scoped client** (RLS) -> not found -> 404.
3. `status === 'pending'`; `expired_at` exists and `expired_at - now >= 2 minutes`; else 409 "Waktu pembayaran habis".
4. Look for the latest `payments` row of this booking with `transaction_status = 'pending'` and a `snap_token` created within the remaining hold -> if found, **return its token** (idempotent; handles double click and second tab).
5. Otherwise build a new `order_id = ORD-${booking.id}-${Math.floor(Date.now()/1000)}` and insert into `payments` (service-role client) with `gross_amount = booking.total_harga` (the DB trigger re-checks equality).
6. Call Snap `createTransaction`:
```jsonc
{
  "transaction_details": { "order_id": "ORD-12-1767000000", "gross_amount": 1000000 },   // integer Rupiah
  "item_details": [{
    "id": "ROOMTYPE-2", "name": "Deluxe Room (2 malam)",        // name max 50 chars
    "price": 500000, "quantity": 2                              // sum(price*quantity) MUST equal gross_amount
  }],
  "customer_details": { "first_name": "<nama_tamu>", "email": "<email_tamu>", "phone": "<no_hp_tamu>" },
  "expiry": { "unit": "minute", "duration": <remaining minutes, min 1> },   // aligns Midtrans expiry with booking hold
  "callbacks": { "finish": "<SITE_URL>/booking/<id>/status" }
}
```
   Use `harga_per_malam` and nights read from the DB (join `rooms -> room_types`), not from the client. If rounding makes `price*quantity` differ from `gross_amount`, fix the item list rather than the amount.
7. Save `snap_token` on the payment row; return `{ token }`.
8. Midtrans error/timeout (10s) -> delete the unusable pending payment row (or mark `failure`) and return `EXTERNAL_SERVICE`.

## 3. Client: opening the popup

- Load the Snap script with `next/script` (`strategy="afterInteractive"`, `data-client-key` from `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`) only on the checkout page. Track `onLoad`/`onError` state; disable the pay button until loaded; on error show the "Gagal memuat pembayaran" message.
- Button flow: disable button + spinner -> `POST /api/midtrans/create-transaction` -> `window.snap.pay(token, handlers)` -> re-enable on close/error.
- Handlers (UI only, none of them changes server state):
  - `onSuccess` / `onPending` -> `router.push('/booking/[id]/status')`
  - `onClose` -> toast info "Pembayaran belum diselesaikan"; stay on page
  - `onError` -> toast error "Pembayaran gagal. Coba lagi."
- Add `window.snap` typings in `src/types/snap.d.ts`.

## 4. Webhook: `POST /api/midtrans/notification`

Runs with the service-role client. Implement as a **shared function** `applyMidtransStatus(payload)` used by the webhook and by the status-check path.

Algorithm:
1. Read body as JSON in `try/catch` (invalid -> 400). Reject if body > 100 KB. Require string fields: `order_id`, `status_code`, `gross_amount`, `signature_key`, `transaction_status`.
2. **Verify signature** from the raw strings: `sha512(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)` hex, `timingSafeEqual` against `signature_key`. Mismatch -> log warn, return **401**. (`gross_amount` is a string like `"1000000.00"`: concatenate exactly as received.)
3. Load `payments` by `order_id`. Not found -> log warn, return **200** (Midtrans dashboard "test notification" uses fake ids).
4. Defense in depth: call Midtrans `transaction.status(order_id)` and use **that response** as the authoritative status. If the call fails, fall back to the verified notification body.
5. Verify amount: `Number(status.gross_amount) === Number(payment.gross_amount)`; otherwise set `needs_review = true`, log security event, return 200 without confirming anything.
6. Rank guard: `pending(0) < authorize/capture(1) < deny/failure/cancel/expire(2) < settlement(3) < refund*/chargeback*(4)`. If the new status ranks lower than the stored one, ignore (return 200).
7. Update `payments`: `transaction_status, fraud_status, payment_type, transaction_id, transaction_time, settlement_time, raw_notification` (store the verified payload).
8. Apply the booking effect exactly as the table in `docs/03` section 3.2:
   - paid (`settlement`, or `capture` with `fraud_status = 'accept'`): `update bookings set status='dikonfirmasi' where id=:id and status='pending'`. If 0 rows and the booking is `dibatalkan`: attempt the **late-payment restore** `... where status='dibatalkan'` (the exclusion constraint may refuse if the room was taken; on `23P01` set `needs_review=true`). If already `dikonfirmasi`: no-op.
   - `cancel` / `expire`: if the booking is `pending` and it has no other payment in `pending` or paid state -> `dibatalkan`.
   - `capture` + `challenge`, `refund*`, `chargeback*`: `needs_review = true` only.
9. Return **200** `{ ok: true }`. Return 5xx only for transient infrastructure errors so Midtrans retries.

Everything must be idempotent: running the same payload twice yields the same final state and no error.

## 5. Status endpoint for the status page: `GET /api/midtrans/status?bookingId=`

- `requireUser()` + ownership check. Returns `{ bookingStatus, paymentStatus, final }` where `final = true` for any non-`pending` state.
- If the latest payment is still `pending` and `updated/created` is older than ~10 s, perform the **server-side status check** (`transaction.status(order_id)`) and run `applyMidtransStatus` with the result. This makes the app work even when the webhook cannot reach localhost.
- The page polls every 3 s up to 2 min, then shows "Pembayaran masih diproses" with a refresh button. Also stop polling when the tab is hidden.

## 6. Cancel / expire

- User cancels a pending booking: after `cancel_booking`, call `transaction.cancel(order_id)` for pending payments (ignore errors, log).
- Cron `expire_pending_bookings()` cancels expired bookings in the DB; optionally call `transaction.expire(order_id)` for their pending payments (best effort).
- Never mark a payment `settlement` yourself.

## 7. Sandbox testing cheat sheet (verify in Midtrans docs, values may change)

- Card test number commonly used in sandbox: `4811 1111 1111 1114`, CVV `123`, any future expiry, OTP `112233`.
- Virtual Account / QRIS / e-wallet: use the **Midtrans Payment Simulator** in the sandbox dashboard with the generated VA number/QR to mark the payment as paid. This triggers the webhook.
- To test failure: use the test card scenarios for deny, or let the order expire (set a short `expiry` in a test) or cancel from the dashboard.
- Verify in Midtrans Dashboard > Transactions that the order appears with the same `order_id` stored in `payments`.

## 8. Files to create

```
src/lib/midtrans.ts                       server-only client factory, helpers (signature, status, cancel)
src/lib/payments/apply-status.ts          applyMidtransStatus + rank + booking effects
src/app/api/midtrans/create-transaction/route.ts
src/app/api/midtrans/notification/route.ts
src/app/api/midtrans/status/route.ts
src/components/features/pay-button.tsx    client component, Snap script + popup
src/types/midtrans-client.d.ts, src/types/snap.d.ts
```
Unit-test (Vitest): signature verification (valid/invalid/tampered amount), rank guard, status -> booking effect mapping, `order_id` format/length.
