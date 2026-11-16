'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, Bell, User, LogOut, ExternalLink, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/actions/auth';

export interface AdminAccountInfo {
  nama: string;
  email: string;
}

interface AdminTopbarProps {
  title: string;
  onMenuToggle?: () => void;
  user?: AdminAccountInfo | null;
}

export function AdminTopbar({ title, onMenuToggle, user: initialUser }: AdminTopbarProps) {
  const [loadedUser, setLoadedUser] = useState<AdminAccountInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const admin = initialUser ?? loadedUser;

  useEffect(() => {
    if (initialUser) return;

    let cancelled = false;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (cancelled || !user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('nama_lengkap')
        .eq('id', user.id)
        .single();

      if (cancelled) return;

      const nama =
        profile?.nama_lengkap ||
        (user.user_metadata?.nama_lengkap as string | undefined) ||
        user.email?.split('@')[0] ||
        'Admin';

      setLoadedUser({
        nama,
        email: user.email ?? '',
      });
    });

    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="flex h-20 items-center justify-between border-b border-gold/20 bg-emerald-900 px-6 lg:px-10">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Buka menu admin"
          onClick={onMenuToggle}
          className="text-gold p-2 -ml-2 rounded hover:bg-gold/10 transition-colors lg:hidden"
        >
          <Menu strokeWidth={1.5} className="h-6 w-6" />
        </button>
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gold/75 mb-0.5">
            <span>Console</span>
            <span>/</span>
            <span className="text-ivory/90 font-medium">{title}</span>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl text-ivory tracking-wide">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Admin Account Button & Dropdown */}
        {admin ? (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 border border-gold/30 bg-emerald-950/80 hover:bg-gold/10 px-3 py-1.5 transition-colors group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <div className="text-left hidden sm:block max-w-[140px] md:max-w-[200px]">
                <p className="text-[12px] font-medium text-ivory group-hover:text-gold truncate leading-tight">
                  {admin.nama}
                </p>
                <p className="text-[10px] text-gold/70 tracking-wider truncate">
                  {admin.email || 'Administrator'}
                </p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center bg-gold/20 text-gold text-xs font-serif font-bold sm:hidden">
                {admin.nama.charAt(0).toUpperCase()}
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gold/60 group-hover:text-gold transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 border border-gold/20 bg-emerald-950 p-2 shadow-2xl backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-gold/15 mb-1">
                  <span className="block text-[9px] uppercase tracking-widest text-gold">Akun Admin Aktif</span>
                  <span className="text-xs font-serif text-ivory font-medium truncate block">{admin.nama}</span>
                  <span className="text-[11px] text-muted-ivory/80 truncate block">{admin.email}</span>
                </div>
                <Link
                  href="/akun/profil"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-ivory/85 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-gold" />
                  <span>Profil Akun</span>
                </Link>
                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-ivory/85 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-gold" />
                  <span>Lihat Website</span>
                </Link>
                <form action={signOut} className="mt-1 border-t border-gold/15 pt-1">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Keluar</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 border border-gold/25 bg-gold/5 px-3 py-1.5 text-[11px] text-gold tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="animate-pulse">Memuat Akun...</span>
          </div>
        )}

        <button
          type="button"
          aria-label="Notifikasi"
          className="text-gold p-2 rounded hover:bg-gold/10 transition-colors"
        >
          <Bell strokeWidth={1.25} className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
