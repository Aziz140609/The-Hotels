'use client';

import Link from 'next/link';
import { Menu, Crown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AccountMenu } from './account-menu';

const links = [
  ['Home', '/'],
  ['Ruangan', '/kamar'],
  ['About Us', '/#tentang-kami'],
  ['Contact', '/contact'],
] as const;

export interface NavUser {
  nama: string;
  isAdmin: boolean;
}

interface PublicNavbarProps {
  onMenuOpen?: () => void;
  user?: NavUser | null;
}

export function PublicNavbar({ onMenuOpen, user }: PublicNavbarProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 md:gap-6 rounded-full border border-gold/30 bg-emerald-950/75 p-1.5 md:p-2 shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl transition-all duration-300">
        {/* Left Circular Emblem Logo */}
        <Link
          href="/"
          className="group flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-ivory text-emerald-950 shadow-md transition-all duration-300 hover:scale-105 hover:bg-gold"
          title="The Hotels"
        >
          <Crown className="h-4 w-4 md:h-5 md:w-5 text-emerald-950 transition-transform duration-300 group-hover:rotate-6" strokeWidth={1.75} />
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2 px-1">
          {links.map(([label, href]) => {
            const isActive = href === '/' ? pathname === '/' : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-gold/20 text-gold border border-gold/40 shadow-sm font-medium'
                    : 'text-ivory/80 hover:text-gold hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right Action: User Menu / Login Pill */}
        <div className="flex items-center gap-2">
          {user ? (
            <AccountMenu nama={user.nama} isAdmin={user.isAdmin} />
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-ivory hover:bg-gold text-emerald-950 font-medium px-5 md:px-6 py-2 text-xs uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-105"
            >
              Masuk
            </Link>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            aria-label="Buka menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gold hover:bg-white/20 transition-colors md:hidden"
            onClick={onMenuOpen}
          >
            <Menu className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </nav>
    </header>
  );
}
