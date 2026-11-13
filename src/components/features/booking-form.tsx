'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, differenceInCalendarDays } from 'date-fns';
import { CalendarDays, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { formatRupiah } from '@/lib/format';
import { createBooking } from '@/lib/actions/bookings';
import { toast } from 'sonner';

interface BookingFormProps {
  roomTypeId: number;
  maxGuests: number;
  hargaPerMalam: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  isAuthenticated?: boolean;
}

export function BookingForm({
  roomTypeId,
  maxGuests,
  hargaPerMalam,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  isAuthenticated = false,
}: BookingFormProps) {
  const router = useRouter();
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return format(d, 'yyyy-MM-dd');
  }, []);

  const [checkIn, setCheckIn] = useState(initialCheckIn || today);
  const [checkOut, setCheckOut] = useState(initialCheckOut || tomorrow);
  const [guests, setGuests] = useState(initialGuests ?? 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const nights = useMemo(() => {
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    const diff = differenceInCalendarDays(b, a);
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const total = nights * hargaPerMalam;

  const params = new URLSearchParams({ checkin: checkIn, checkout: checkOut, guests: String(guests) });
  const nextUrl = `/kamar/${roomTypeId}?${params.toString()}`;
  const loginHref = `/login?next=${encodeURIComponent(nextUrl)}`;
  const registerHref = `/register?next=${encodeURIComponent(nextUrl)}`;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (nights <= 0) {
      toast.error('Tanggal check-out harus setelah check-in.');
      return;
    }

    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    setIsSubmitting(true);
    const result = await createBooking({ roomTypeId, checkIn, checkOut, guests });

    if (!result.ok) {
      if (result.code === 'UNAUTHENTICATED') {
        setShowAuthDialog(true);
        setIsSubmitting(false);
        return;
      }
      toast.error(result.message);
      setIsSubmitting(false);
      return;
    }

    router.push(`/booking/${result.data.bookingId}`);
  };

  const inputClass =
    'w-full bg-transparent border-b border-gold/50 focus:border-gold focus:outline-none text-ivory py-1.5 text-[14px] font-light';

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} action="#" className="mt-6 space-y-4 border-t border-gold/20 pt-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkin" className="text-[10px] uppercase tracking-widest text-gold">Check-in</label>
          <div className="mt-1 flex items-center gap-2">
            <input id="checkin" type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputClass} />
            <CalendarDays className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.25} />
          </div>
        </div>
        <div>
          <label htmlFor="checkout" className="text-[10px] uppercase tracking-widest text-gold">Check-out</label>
          <div className="mt-1 flex items-center gap-2">
            <input id="checkout" type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputClass} />
            <CalendarDays className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.25} />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="guests" className="text-[10px] uppercase tracking-widest text-gold">Jumlah Tamu</label>
        <select
          id="guests"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="mt-1 w-full cursor-pointer appearance-none border-b border-gold/50 bg-transparent py-1.5 text-[14px] text-ivory focus:border-gold focus:outline-none"
        >
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((g) => (
            <option key={g} value={g} className="bg-emerald-800">{g} Tamu</option>
          ))}
        </select>
      </div>

      {nights > 0 && (
        <div className="flex items-center justify-between border-t border-gold/20 pt-4 text-sm">
          <span className="text-muted-ivory">{nights} malam</span>
          <span className="font-serif text-xl text-gold">{formatRupiah(total)}</span>
        </div>
      )}

      <Button type="button" onClick={() => handleSubmit()} disabled={isSubmitting || nights <= 0} className="w-full py-4">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          'Pesan Sekarang'
        )}
      </Button>
      <p className="text-center text-[11px] text-muted-ivory">Anda akan diarahkan ke halaman pembayaran</p>

      <Dialog open={showAuthDialog} onClose={() => setShowAuthDialog(false)} title="Masuk untuk Melanjutkan">
        <p className="mb-6 text-[15px] font-light leading-6 text-muted-ivory">
          Anda perlu masuk ke akun terlebih dahulu untuk membuat reservasi. Tanggal yang Anda pilih akan tetap tersimpan.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-location-assign-relative-destination */}
          <Button type="button" onClick={() => { window.location.href = loginHref; }} className="flex-1 py-3">
            Masuk
          </Button>
          {/* eslint-disable-next-line @next/next/no-location-assign-relative-destination */}
          <Button type="button" variant="outline" onClick={() => { window.location.href = registerHref; }} className="flex-1 py-3">
            Daftar Akun
          </Button>
        </div>
      </Dialog>
    </form>
  );
}
