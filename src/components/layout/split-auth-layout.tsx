import type { ReactNode } from 'react';

interface SplitAuthLayoutProps { title: string; subtitle: string; children: ReactNode; }

export function SplitAuthLayout({ title, subtitle, children }: SplitAuthLayoutProps) {
  return <main className="grid min-h-screen lg:grid-cols-2"><section className="hidden bg-emerald-950 p-16 lg:flex lg:flex-col lg:justify-end"><p className="text-[11px] uppercase tracking-label text-gold">Sanctuary of Surakarta</p><h1 className="mt-4 max-w-md font-serif text-6xl font-normal leading-none text-ivory">Ketenangan dalam kemewahan.</h1></section><section className="flex items-center justify-center bg-emerald-900 px-6 py-16"><div className="w-full max-w-md"><p className="text-[11px] uppercase tracking-label text-gold">THE HOTELS</p><h1 className="mt-4 font-serif text-4xl text-ivory">{title}</h1><p className="mt-3 text-sm font-light leading-6 text-muted-ivory">{subtitle}</p><div className="mt-10">{children}</div></div></section></main>;
}
