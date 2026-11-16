import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface SplitAuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function SplitAuthLayout({ title, subtitle, children }: SplitAuthLayoutProps) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Sisi Kiri: Foto Estetik Hotel dengan Overlay Emerald & Tipografi Mewah */}
      <section className="relative hidden bg-emerald-950 p-16 lg:flex lg:flex-col lg:justify-between overflow-hidden">
        <Image
          src="/images/hero.png"
          alt="The Hotels Sanctuary"
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        {/* Dark Emerald & Vignette Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/75 to-emerald-950/45" />

        {/* Link Kembali ke Beranda */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold/90 hover:text-ivory transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Teks Ketenangan dalam Kemewahan */}
        <div className="relative z-10 max-w-lg">
          <p className="text-[11px] uppercase tracking-label text-gold font-medium">Sanctuary of Surakarta</p>
          <h1 className="mt-4 font-serif text-5xl xl:text-6xl font-normal leading-tight text-ivory drop-shadow-md">
            Ketenangan dalam kemewahan.
          </h1>
          <p className="mt-4 text-sm font-light leading-relaxed text-muted-ivory/90 max-w-md">
            Harmoni warisan arsitektur Jawa klasik yang berpadu dengan ketenangan dan kemewahan bintang lima.
          </p>
        </div>
      </section>

      {/* Sisi Kanan: Form Auth (Login / Register / Lupa Password) */}
      <section className="flex items-center justify-center bg-emerald-900 px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-[11px] uppercase tracking-label text-gold">THE HOTELS</p>
          <h1 className="mt-4 font-serif text-4xl text-ivory">{title}</h1>
          <p className="mt-3 text-sm font-light leading-6 text-muted-ivory">{subtitle}</p>
          <div className="mt-10">{children}</div>
        </div>
      </section>
    </main>
  );
}
