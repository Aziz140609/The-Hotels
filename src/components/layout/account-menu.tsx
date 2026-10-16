'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, LayoutDashboard, LogOut, User, CalendarCheck } from 'lucide-react';
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 border border-gold/70 px-4 py-2 text-[11px] uppercase tracking-label text-gold hover:bg-gold hover:text-emerald-900"
      >
        {nama}
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 border border-gold/30 bg-emerald-900 py-2 shadow-xl">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-ivory hover:bg-emerald-800"
            >
              <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
          <form action={signOut} className="border-t border-gold/20">
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-[12px] text-danger hover:bg-emerald-800"
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
