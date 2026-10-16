'use client';

import { useState, type ReactNode } from 'react';
import { MobileDrawer } from './mobile-drawer';
import { PublicFooter } from './public-footer';
import { PublicNavbar, type NavUser } from './public-navbar';

export function PublicShell({ children, user }: { children: ReactNode; user?: NavUser | null }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-emerald-900">
      <PublicNavbar onMenuOpen={() => setMenuOpen(true)} user={user} />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} user={user} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
