'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

const links = [
  ['Home', '/'],
  ['Ruangan', '/kamar'],
  ['About Us', '/about'],
  ['Contact', '/contact'],
] as const;

interface PublicNavbarProps { onMenuOpen?: () => void; }

export function PublicNavbar({ onMenuOpen }: PublicNavbarProps) {
  const pathname = usePathname();
  return <header className="sticky top-0 z-40 border-b border-gold/20 bg-emerald-900"><nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-20"><Link href="/" className="font-serif text-xl tracking-[0.16em] text-ivory">THE HOTELS</Link><div className="hidden items-center gap-8 md:flex">{links.map(([label, href]) => <Link key={href} href={href} className={`border-b py-1 text-[11px] uppercase tracking-label transition-colors ${pathname === href ? 'border-gold text-gold' : 'border-transparent text-muted-ivory hover:text-gold'}`}>{label}</Link>)}<Link href="/login" className="border border-gold/70 px-5 py-2 text-[11px] uppercase tracking-label text-gold hover:bg-gold hover:text-emerald-900">Masuk</Link></div><button type="button" aria-label="Buka menu" className="text-gold md:hidden" onClick={onMenuOpen}><Menu strokeWidth={1.25} /></button></nav></header>;
}
