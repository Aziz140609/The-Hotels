'use client';

import { Button } from '@/components/ui/button';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-emerald-900 px-6 text-center">
      <p className="text-[11px] uppercase tracking-label text-gold">Terjadi Kesalahan</p>
      <h1 className="mt-3 font-serif text-4xl text-ivory">Halaman tidak dapat dimuat</h1>
      <p className="mt-3 max-w-md text-sm font-light text-muted-ivory">Silakan coba lagi sesaat lagi.</p>
      <Button className="mt-8" variant="outline" onClick={reset}>Coba Lagi</Button>
    </main>
  );
}
