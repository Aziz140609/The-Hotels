'use client';

import Link from 'next/link';
import { Home, BedDouble, Sparkles, MessageSquare, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AccountMenu } from './account-menu';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Ruangan', href: '/kamar', icon: BedDouble },
  { label: 'Tentang', href: '/#tentang-kami', icon: Sparkles },
  { label: 'Kontak', href: '/contact', icon: MessageSquare },
] as const;

export interface NavUser {
  nama: string;
  isAdmin: boolean;
}

interface PublicNavbarProps {
  onMenuOpen?: () => void;
  user?: NavUser | null;
}

export function PublicNavbar({ user }: PublicNavbarProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        className="capsule-pill pointer-events-auto relative flex items-center gap-1 sm:gap-2 rounded-full border border-white/15 bg-[#081814]/85 px-3 py-2 sm:px-4 sm:py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl transition-all duration-300"
        style={{ borderRadius: '9999px' }}
      >
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`capsule-pill group relative flex items-center gap-2 rounded-full px-3.5 py-2 sm:px-4 sm:py-2 transition-all duration-300 ${
                isActive ? 'text-gold' : 'text-ivory/70 hover:text-gold'
              }`}
              style={{ borderRadius: '9999px' }}
            >
              {/* Soft Radiant Aurora Glow (inspired by screenshot) */}
              {isActive && (
                <span
                  className="capsule-pill absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-amber-400/35 via-emerald-400/30 to-gold/35 blur-md"
                  style={{ borderRadius: '9999px' }}
                />
              )}
              <span
                className="capsule-pill absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-amber-400/20 via-emerald-400/20 to-gold/20 blur-md"
                style={{ borderRadius: '9999px' }}
              />

              {/* Icon */}
              <Icon
                className={`h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-gold drop-shadow-[0_0_8px_rgba(201,169,110,0.7)]' : 'text-ivory/80 group-hover:text-gold'
                }`}
                strokeWidth={1.75}
              />

              {/* Label */}
              <span
                className={`text-[11px] sm:text-xs tracking-wider uppercase transition-colors ${
                  isActive
                    ? 'font-medium text-ivory drop-shadow-sm'
                    : 'hidden sm:inline font-normal text-ivory/80 group-hover:text-gold'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* Subtle Separator */}
        <div className="h-5 w-px bg-white/15 mx-1" />

        {/* Right Circular Avatar / Profile Button with Glowing Ring */}
        <div className="flex items-center pl-0.5 pr-0.5">
          {user ? (
            <AccountMenu nama={user.nama} isAdmin={user.isAdmin} />
          ) : (
            <Link
              href="/login"
              title="Masuk ke Akun"
              className="avatar-circle group relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-emerald-950 ring-2 ring-gold/80 ring-offset-2 ring-offset-[#081814] shadow-[0_0_12px_rgba(201,169,110,0.35)] transition-all duration-300 hover:scale-105 hover:ring-gold hover:shadow-[0_0_18px_rgba(201,169,110,0.6)]"
              style={{ borderRadius: '50%' }}
            >
              <User className="h-4 w-4 text-gold transition-transform duration-300 group-hover:scale-110" strokeWidth={1.75} />
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
