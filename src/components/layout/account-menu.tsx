'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut, User, CalendarCheck } from 'lucide-react';
import { signOut } from '@/lib/actions/auth';

interface AccountMenuProps {
  nama: string;
  isAdmin: boolean;
}

export function AccountMenu({ nama, isAdmin }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const items = [
    { href: '/akun/profil', label: 'Profil Saya', icon: User },
    { href: '/akun/booking', label: 'Booking Saya', icon: CalendarCheck },
    ...(isAdmin ? [{ href: '/admin', label: 'Panel Admin', icon: LayoutDashboard }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      {/* Circular Avatar with Glowing Ring */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={nama}
        className="avatar-circle group relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/40 via-emerald-900 to-emerald-950 ring-2 ring-gold/90 ring-offset-2 ring-offset-[#0B1E19] shadow-[0_0_14px_rgba(201,169,110,0.4)] transition-all duration-300 hover:scale-105 hover:ring-gold hover:shadow-[0_0_20px_rgba(201,169,110,0.7)]"
        style={{ borderRadius: '50%' }}
      >
        <span className="font-serif text-sm font-semibold uppercase text-gold drop-shadow">
          {nama.charAt(0)}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-56 rounded-3xl border border-white/10 bg-[#0B1E19]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          <div className="px-4 py-2 border-b border-white/10 mb-1">
            <span className="block text-[10px] uppercase tracking-widest text-gold/80">Akun Anda</span>
            <span className="text-sm font-serif text-ivory font-medium truncate block">{nama}</span>
          </div>
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-full px-4 py-2.5 text-[12px] text-ivory/85 transition-colors hover:bg-white/10 hover:text-gold"
            >
              <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
          <form action={signOut} className="mt-1 border-t border-white/10 pt-1">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-[12px] text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Keluar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
