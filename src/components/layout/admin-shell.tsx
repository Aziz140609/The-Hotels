import type { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

interface AdminShellProps {
  title: string;
  children: ReactNode;
}

export function AdminShell({ title, children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-emerald-900">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminTopbar title={title} />
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
