import Link from 'next/link';
import { BarChart3, BedDouble, CalendarDays, FileText, Users } from 'lucide-react';

const links = [
  ['Dashboard', '/admin', BarChart3],
  ['Tipe Kamar', '/admin/tipe-kamar', BedDouble],
  ['Booking', '/admin/booking', CalendarDays],
  ['Pengguna', '/admin/pengguna', Users],
  ['Laporan', '/admin/laporan', FileText],
] as const;

export function AdminSidebar() {
  return <aside className="hidden min-h-screen w-64 shrink-0 border-r border-gold/20 bg-emerald-950 p-6 lg:block"><Link href="/admin" className="font-serif text-xl tracking-[0.14em] text-ivory">THE HOTELS</Link><p className="mt-2 text-[10px] uppercase tracking-label text-gold">Admin Console</p><nav className="mt-12 flex flex-col">{links.map(([label, href, Icon]) => <Link key={href} href={href} className="flex items-center gap-3 border-b border-gold/15 py-4 text-xs uppercase tracking-wide text-muted-ivory hover:text-gold"><Icon className="h-4 w-4" strokeWidth={1.25} />{label}</Link>)}</nav></aside>;
}
