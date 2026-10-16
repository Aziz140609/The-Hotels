'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PayButtonProps {
  bookingId: number;
  clientKey: string;
  isProduction: boolean;
  disabled?: boolean;
}

export function PayButton({ bookingId, clientKey, isProduction, disabled }: PayButtonProps) {
  const router = useRouter();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const scriptUrl = isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  const handlePay = async () => {
    setIsPaying(true);
    try {
      const res = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message || 'Gagal memulai pembayaran');

      window.snap?.pay(data.data.token, {
        onSuccess: () => router.push(`/booking/${bookingId}/status`),
        onPending: () => router.push(`/booking/${bookingId}/status`),
        onError: () => toast.error('Pembayaran gagal. Coba lagi.'),
        onClose: () => {
          setIsPaying(false);
          toast.info('Pembayaran belum diselesaikan');
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memulai pembayaran');
      setIsPaying(false);
    }
  };

  if (scriptError) {
    return <p className="text-center text-sm text-danger">Gagal memuat pembayaran. Muat ulang halaman.</p>;
  }

  return (
    <>
      <Script
        src={scriptUrl}
        data-client-key={clientKey}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setScriptError(true)}
      />
      <Button
        onClick={handlePay}
        disabled={disabled || !scriptLoaded || isPaying}
        className="w-full py-4"
      >
        {isPaying ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" strokeWidth={1.25} />
            Bayar Sekarang
          </>
        )}
      </Button>
    </>
  );
}
