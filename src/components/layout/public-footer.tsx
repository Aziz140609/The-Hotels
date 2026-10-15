import Link from 'next/link';
import { Camera, Globe2, MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { HOTEL } from '@/lib/constants';

const links = [
  ['Home', '/'],
  ['Ruangan', '/kamar'],
  ['About Us', '/about'],
  ['Contact', '/contact'],
] as const;

export function PublicFooter() {
  return <footer className="border-t border-gold/20 bg-emerald-950 px-6 py-16 text-muted-ivory lg:px-20"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-4"><div><p className="font-serif text-2xl tracking-wide text-ivory">THE HOTELS</p><p className="mt-3 max-w-xs text-sm font-light leading-6">Suaka ketenangan dan kemewahan otentik di Surakarta.</p></div><div><p className="text-[11px] font-medium uppercase tracking-label text-gold">Menu</p><nav className="mt-4 flex flex-col gap-2">{links.map(([label, href]) => <Link key={href} href={href} className="text-sm font-light hover:text-gold">{label}</Link>)}</nav></div><div><p className="text-[11px] font-medium uppercase tracking-label text-gold">Kontak</p><address className="mt-4 flex flex-col gap-2 text-sm font-light not-italic"><span>{HOTEL.address}</span><span>{HOTEL.phone}</span><a href={`mailto:${HOTEL.email}`} className="hover:text-gold">{HOTEL.email}</a></address></div><div><p className="text-[11px] font-medium uppercase tracking-label text-gold">Ikuti Kami</p><div className="mt-4 flex gap-2"><SocialIcon label="Instagram"><Camera /></SocialIcon><SocialIcon label="Facebook"><Globe2 /></SocialIcon><SocialIcon label="WhatsApp"><MessageCircle /></SocialIcon></div></div></div><div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-gold/20 pt-6 text-xs font-light md:flex-row md:justify-between"><span>© 2026 The Hotels. All rights reserved.</span><span>Privasi · Syarat Reservasi</span></div></footer>;
}

function SocialIcon({ label, children }: { label: string; children: ReactNode }) {
  return <a href="#" aria-label={label} className="flex h-10 w-10 items-center justify-center border border-gold/30 text-muted-ivory hover:border-gold hover:text-gold">{children}</a>;
}
