'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Countdown } from '@/components/ui/countdown';
import { PayButton } from '@/components/features/pay-button';
import { formatRupiah } from '@/lib/format';
import { toast } from 'sonner';

interface BookingData {
  id: number;
  kode_booking: string;
  check_in: string;
  check_out: string;
  jumlah_tamu: number;
  total_harga: number;
  status: string;
  expired_at: string | null;
  nama_tamu: string;
  email_tamu: string;
  no_hp_tamu: string;
  catatan: string | null;
  rooms: {
    nomor_kamar: string;
    room_types: {
      nama: string;
      harga_per_malam: number;
      foto_url: string | null;
    };
  };
}

interface BookingCheckoutProps {
  booking: BookingData;
  clientKey: string;
  isProduction: boolean;
}

export function BookingCheckout({ booking, clientKey, isProduction }: BookingCheckoutProps) {
  const router = useRouter();

  const [expired, setExpired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [guestData, setGuestData] = useState({
    nama: booking.nama_tamu,
    email: booking.email_tamu,
    hp: booking.no_hp_tamu,
    catatan: booking.catatan || '',
  });

  const [agreed, setAgreed] = useState(false);

  const nights = differenceInCalendarDays(
    parseISO(booking.check_out),
    parseISO(booking.check_in)
  );

  const checkInStr = format(parseISO(booking.check_in), 'd MMM yyyy', { locale: id });
  const checkOutStr = format(parseISO(booking.check_out), 'd MMM yyyy', { locale: id });

  useEffect(() => {
    if (booking.status !== 'pending' || !booking.expired_at) return;
    const expiry = new Date(booking.expired_at).getTime();
    const timer = setInterval(() => {
      if (Date.now() >= expiry) {
        setExpired(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [booking.expired_at, booking.status]);

  const handleGuestChange = (field: string, value: string) => {
    setGuestData((prev) => ({ ...prev, [field]: value }));
  };

  const saveGuest = async (): Promise<boolean> => {
    const res = await fetch(`/api/booking/${booking.id}/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guestData),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Gagal menyimpan data tamu');
    return true;
  };

  const handleSaveGuest = async () => {
    setIsSaving(true);
    try {
      await saveGuest();
      toast.success('Data tamu tersimpan');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data tamu');
    } finally {
      setIsSaving(false);
    }
  };

  if (booking.status !== 'pending') {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <p className="mb-4 text-danger">Booking ini sudah tidak bisa dibayar</p>
        <p className="text-muted-ivory">Status: {booking.status}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push(`/booking/${booking.id}/status`)}>
          Lihat Status
        </Button>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-danger" strokeWidth={1.25} />
        <p className="mb-2 text-xl text-danger">Waktu Pembayaran Habis</p>
        <p className="mb-6 text-muted-ivory">Booking ini telah kedaluwarsa dan dibatalkan otomatis.</p>
        <Button variant="outline" onClick={() => router.push('/kamar')}>Cari Kamar Lain</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-emerald-900 px-6 py-10 text-ivory lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Checkout</span>
          <h1 className="mt-2 font-serif text-4xl font-normal tracking-tight text-ivory md:text-5xl">
            Selesaikan Pemesanan
          </h1>
          <div className="my-3 h-px w-16 bg-gold/40" />
          <p className="text-sm text-muted-ivory">Kode Booking: {booking.kode_booking}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="border border-gold/30 bg-emerald-800/50 p-6">
              <h2 className="mb-4 font-serif text-2xl text-ivory">Data Tamu</h2>
              <div className="space-y-4">
                <FormField id="nama" label="Nama Lengkap">
                  <Input id="nama" value={guestData.nama} onChange={(e) => handleGuestChange('nama', e.target.value)} required />
                </FormField>
                <FormField id="email" label="Email">
                  <Input id="email" type="email" value={guestData.email} onChange={(e) => handleGuestChange('email', e.target.value)} required />
                </FormField>
                <FormField id="hp" label="Nomor HP">
                  <Input id="hp" type="tel" value={guestData.hp} onChange={(e) => handleGuestChange('hp', e.target.value)} required />
                </FormField>
                <FormField id="catatan" label="Catatan (opsional)">
                  <Textarea id="catatan" value={guestData.catatan} onChange={(e) => handleGuestChange('catatan', e.target.value)} rows={3} />
                </FormField>
              </div>
              <div className="mt-4 border-t border-gold/20 pt-4">
                <Button onClick={handleSaveGuest} disabled={isSaving} className="w-full" variant="outline">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Simpan Data Tamu
                </Button>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 border border-gold/30 bg-emerald-800/50 p-6">
              <div>
                <h3 className="mb-4 font-serif text-xl text-ivory">Ringkasan Booking</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-ivory">{booking.rooms.room_types.nama}</span>
                    <span className="text-ivory">{formatRupiah(booking.rooms.room_types.harga_per_malam)} / malam</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-ivory">{nights} Malam</span>
                    <span className="text-ivory">{checkInStr} - {checkOutStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-ivory">{booking.jumlah_tamu} Tamu</span>
                    <span className="text-ivory">Kamar {booking.rooms.nomor_kamar}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-gold/20 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-ivory">Subtotal ({nights} malam)</span>
                  <span className="text-ivory">{formatRupiah(booking.rooms.room_types.harga_per_malam * nights)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-ivory">Total</span>
                  <span className="font-serif text-xl text-gold">{formatRupiah(booking.total_harga)}</span>
                </div>
              </div>

              <div className="border-t border-gold/20 pt-4">
                <Countdown expiresAt={booking.expired_at!} onExpire={() => setExpired(true)} />
                <p className="mt-2 text-[11px] text-muted-ivory">Waktu tersisa untuk pembayaran</p>
              </div>

              <Checkbox
                id="payAgreed"
                label="Saya menyetujui syarat pembayaran dan kebijakan pembatalan"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />

              <PayButton
                bookingId={booking.id}
                clientKey={clientKey}
                isProduction={isProduction}
                disabled={!agreed || !guestData.nama || !guestData.email || !guestData.hp}
              />

              <p className="text-center text-[11px] text-muted-ivory">
                Anda akan diarahkan ke halaman pembayaran Midtrans
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}