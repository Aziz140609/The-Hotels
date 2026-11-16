'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BedDouble,
  DoorOpen,
  CalendarDays,
  Users,
  FileText,
  MessageSquare,
  ArrowLeft,
  X,
} from 'lucide-react';

export const ADMIN_NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: BarChart3 },
  { label: 'Tipe Kamar', href: '/admin/tipe-kamar', icon: BedDouble },
  { label: 'Kamar', href: '/admin/kamar', icon: DoorOpen },
  { label: 'Booking', href: '/admin/booking', icon: CalendarDays },
  { label: 'Pengguna', href: '/admin/pengguna', icon: Users },
  { label: 'Laporan', href: '/admin/laporan', icon: FileText },
  { label: 'Pesan Masuk', href: '/admin/pesan', icon: MessageSquare },
] as const;

interface AdminSidebarProps {
  onClose?: () => void;
  className?: string;
}

export function AdminSidebar({ onClose, className = '' }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`min-h-screen w-64 shrink-0 border-r border-gold/20 bg-emerald-950 p-6 flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            onClick={onClose}
            className="font-serif text-xl tracking-[0.14em] text-ivory hover:text-gold transition-colors block"
          >
            THE HOTELS
          </Link>
          <p className="mt-1 text-[10px] uppercase tracking-label text-gold">Admin Console</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="text-muted-ivory hover:text-gold lg:hidden p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="mt-10 flex flex-col space-y-1">
        {ADMIN_NAV_LINKS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/admin'
              ? pathname === '/admin'
              : pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`group relative flex items-center gap-3.5 border-b border-gold/15 py-3.5 px-3 text-xs uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-gold/25 via-gold/10 to-transparent font-medium text-gold'
                  : 'text-muted-ivory/80 hover:bg-gold/5 hover:text-gold'
              }`}
            >
              {/* Left active accent bar with golden glow */}
              {isActive && (
                <span className="absolute inset-y-0 left-0 w-1 bg-gold shadow-[0_0_10px_rgba(201,169,110,0.8)]" />
              )}

              {/* Icon */}
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive
                    ? 'text-gold scale-110 drop-shadow-[0_0_8px_rgba(201,169,110,0.6)]'
                    : 'text-muted-ivory group-hover:text-gold group-hover:scale-105'
                }`}
                strokeWidth={isActive ? 1.75 : 1.25}
              />

              {/* Label */}
              <span className="truncate">{label}</span>

              {/* Right glowing active indicator dot (clean, without text) */}
              {isActive && (
                <span className="ml-auto flex items-center">
                  <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_rgba(201,169,110,0.9)] animate-pulse" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer link to public website */}
      <div className="mt-auto pt-8 border-t border-gold/15">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[11px] uppercase tracking-wider text-muted-ivory/70 hover:text-gold transition-colors py-2 px-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Website</span>
        </Link>
      </div>
    </aside>
  );
}
