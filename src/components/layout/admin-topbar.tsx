import { Menu, Bell } from 'lucide-react';

interface AdminTopbarProps {
  title: string;
  onMenuToggle?: () => void;
}

export function AdminTopbar({ title, onMenuToggle }: AdminTopbarProps) {
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
        <div className="hidden sm:flex items-center gap-2 border border-gold/25 bg-gold/5 px-3 py-1 rounded text-[11px] text-gold tracking-wider uppercase">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Admin Aktif</span>
        </div>
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
