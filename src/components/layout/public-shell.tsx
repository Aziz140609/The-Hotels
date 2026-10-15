'use client';

import { useState, type ReactNode } from 'react';
import { MobileDrawer } from './mobile-drawer';
import { PublicFooter } from './public-footer';
import { PublicNavbar } from './public-navbar';

export function PublicShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-emerald-900">
      <PublicNavbar onMenuOpen={() => setMenuOpen(true)} />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
