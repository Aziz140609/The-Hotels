'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { signOut } from '@/lib/actions/auth';
import type { NavUser } from './public-navbar';

const links = [['Home', '/'], ['Ruangan', '/kamar'], ['About Us', '/about'], ['Contact', '/contact']] as const;

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  user?: NavUser | null;
}

export function MobileDrawer({ open, onClose, user }: MobileDrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/80 md:hidden">
      <aside className="ml-auto flex h-full w-80 flex-col border-l border-gold/30 bg-emerald-900 p-6">
        <div className="flex items-center justify-between border-b border-gold/30 pb-5">
          <span className="font-serif text-xl tracking-wide">THE HOTELS</span>
          <button onClick={onClose} aria-label="Tutup menu" className="text-gold">
            <X strokeWidth={1.25} />
          </button>
        </div>
        <nav className="mt-8 flex flex-col">
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={onClose} className="border-b border-gold/20 py-4 text-xs uppercase tracking-label text-ivory hover:text-gold">
              {label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/akun/profil" onClick={onClose} className="border border-gold px-5 py-3 text-center text-xs uppercase tracking-label text-gold">
              Profil Saya
            </Link>
            <Link href="/akun/booking" onClick={onClose} className="border border-gold px-5 py-3 text-center text-xs uppercase tracking-label text-gold">
              Booking Saya
            </Link>
            {user.isAdmin && (
              <Link href="/admin" onClick={onClose} className="border border-gold px-5 py-3 text-center text-xs uppercase tracking-label text-gold">
                Panel Admin
              </Link>
            )}
            <form action={signOut}>
              <button type="submit" className="w-full border border-danger/70 px-5 py-3 text-center text-xs uppercase tracking-label text-danger">
                Keluar
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" onClick={onClose} className="mt-8 border border-gold px-5 py-3 text-center text-xs uppercase tracking-label text-gold">
            Masuk
          </Link>
        )}
      </aside>
    </div>
  );
}
