'use client';

import Link from 'next/link';
import { X } from 'lucide-react';

const links = [['Home', '/'], ['Ruangan', '/kamar'], ['About Us', '/about'], ['Contact', '/contact']] as const;

interface MobileDrawerProps { open: boolean; onClose: () => void; }

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 bg-emerald-950/80 md:hidden"><aside className="ml-auto flex h-full w-80 flex-col border-l border-gold/30 bg-emerald-900 p-6"><div className="flex items-center justify-between border-b border-gold/30 pb-5"><span className="font-serif text-xl tracking-wide">THE HOTELS</span><button onClick={onClose} aria-label="Tutup menu" className="text-gold"><X strokeWidth={1.25} /></button></div><nav className="mt-8 flex flex-col">{links.map(([label, href]) => <Link key={href} href={href} onClick={onClose} className="border-b border-gold/20 py-4 text-xs uppercase tracking-label text-ivory hover:text-gold">{label}</Link>)}</nav><Link href="/login" onClick={onClose} className="mt-8 border border-gold px-5 py-3 text-center text-xs uppercase tracking-label text-gold">Masuk</Link></aside></div>;
}
