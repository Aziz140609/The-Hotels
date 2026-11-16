'use client';

import { useState, type ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

interface AdminShellProps {
  title: string;
  children: ReactNode;
}

export function AdminShell({ title, children }: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-emerald-900">
      {/* Desktop Sidebar */}
      <AdminSidebar className="hidden lg:flex" />

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex h-full shadow-2xl">
            <AdminSidebar onClose={() => setMobileMenuOpen(false)} className="flex" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        <AdminTopbar title={title} onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="p-6 lg:p-10 flex-1">{children}</main>
      </div>
    </div>
  );
}
