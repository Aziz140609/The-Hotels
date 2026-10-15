'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return <Toaster position="top-right" richColors closeButton toastOptions={{ className: 'rounded-none border border-gold/30 bg-emerald-800 text-ivory' }} />;
}
