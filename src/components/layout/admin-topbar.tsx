import { Menu, Bell } from 'lucide-react';

interface AdminTopbarProps { title: string; }

export function AdminTopbar({ title }: AdminTopbarProps) {
  return <header className="flex h-20 items-center justify-between border-b border-gold/20 bg-emerald-900 px-6 lg:px-10"><div className="flex items-center gap-4"><button aria-label="Buka menu admin" className="text-gold lg:hidden"><Menu strokeWidth={1.25} /></button><h1 className="font-serif text-3xl text-ivory">{title}</h1></div><button aria-label="Notifikasi" className="text-gold"><Bell strokeWidth={1.25} /></button></header>;
}
