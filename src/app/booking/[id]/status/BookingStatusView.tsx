'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/format';

interface StatusViewProps {
  bookingId: number;
  kodeBooking: string;
  roomName: string;
  totalHarga: number;
  initialBookingStatus: string;
  initialPaymentStatus: string | null;
}

const POLL_INTERVAL = 3000;
const MAX_POLL_MS = 120_000;

export function BookingStatusView({
  bookingId,
  kodeBooking,
  roomName,
  totalHarga,
  initialBookingStatus,
  initialPaymentStatus,
}: StatusViewProps) {
  const [bookingStatus, setBookingStatus] = useState(initialBookingStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [final, setFinal] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef(0);

  const poll = useCallback(async () => {
    const res = await fetch(`/api/midtrans/status?bookingId=${bookingId}`);
    if (!res.ok) return;
    const json = await res.json();
    if (json.ok) {
      setBookingStatus(json.data.bookingStatus);
      setPaymentStatus(json.data.paymentStatus);
      setFinal(json.data.final);
    }
  }, [bookingId]);

  useEffect(() => {
    if (final) return;
    startedAt.current = Date.now();

    const tick = () => {
      if (document.hidden) return;
      if (Date.now() - startedAt.current > MAX_POLL_MS) {
        setTimedOut(true);
        return;
      }
      void poll();
    };

    const timer = window.setInterval(tick, POLL_INTERVAL);
    const onVisible = () => { if (!document.hidden) void poll(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [final, poll]);

  const handleRefresh = () => {
    startedAt.current = Date.now();
    setTimedOut(false);
    void poll();
  };

  const isPaid = bookingStatus === 'dikonfirmasi' || bookingStatus === 'checked_in' || bookingStatus === 'selesai' ||
    paymentStatus === 'settlement' || paymentStatus === 'capture';
  const isFailed = bookingStatus === 'dibatalkan' || paymentStatus === 'cancel' || paymentStatus === 'expire' ||
    paymentStatus === 'deny' || paymentStatus === 'failure';

  return (
    <div className="mx-auto max-w-xl">
      <div className="border border-gold/30 bg-emerald-800/50 p-8 text-center">
        {isPaid ? (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" strokeWidth={1.25} />
            <h1 className="mt-4 font-serif text-3xl text-ivory">Pembayaran Berhasil</h1>
            <p className="mt-2 text-sm text-muted-ivory">
              Terima kasih. Booking <span className="text-gold">{kodeBooking}</span> telah dikonfirmasi.
            </p>
          </>
        ) : isFailed ? (
          <>
            <XCircle className="mx-auto h-14 w-14 text-danger" strokeWidth={1.25} />
            <h1 className="mt-4 font-serif text-3xl text-ivory">Pembayaran Gagal</h1>
            <p className="mt-2 text-sm text-muted-ivory">
              Booking <span className="text-gold">{kodeBooking}</span> dibatalkan. Silakan buat booking baru.
            </p>
          </>
        ) : timedOut ? (
          <>
            <Clock className="mx-auto h-14 w-14 text-gold" strokeWidth={1.25} />
            <h1 className="mt-4 font-serif text-3xl text-ivory">Pembayaran Masih Diproses</h1>
            <p className="mt-2 text-sm text-muted-ivory">
              Kami belum menerima konfirmasi pembayaran. Periksa beberapa saat lagi.
            </p>
            <Button variant="outline" className="mt-6" onClick={handleRefresh}>Cek Lagi</Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-14 w-14 animate-spin text-gold" strokeWidth={1.25} />
            <h1 className="mt-4 font-serif text-3xl text-ivory">Menunggu Pembayaran</h1>
            <p className="mt-2 text-sm text-muted-ivory">
              Selesaikan pembayaran Anda. Halaman ini akan diperbarui otomatis.
            </p>
          </>
        )}

        <div className="mt-8 space-y-2 border-t border-gold/20 pt-6 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-ivory">Kode Booking</span>
            <span className="text-ivory">{kodeBooking}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-ivory">Kamar</span>
            <span className="text-ivory">{roomName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-ivory">Total</span>
            <span className="font-serif text-lg text-gold">{formatRupiah(totalHarga)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/akun/booking"><Button className="w-full sm:w-auto">Lihat Booking Saya</Button></Link>
        {isPaid && (
          <Link href={`/booking/${bookingId}/bukti`}>
            <Button variant="outline" className="w-full sm:w-auto">Cetak Bukti</Button>
          </Link>
        )}
        {isFailed && (
          <Link href="/kamar"><Button variant="outline" className="w-full sm:w-auto">Cari Kamar Lain</Button></Link>
        )}
      </div>
    </div>
  );
}
