import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  return rupiahFormatter.format(amount).replace(/\s/g, '');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMM yyyy', { locale: id });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "d MMM yyyy, HH.mm 'WIB'", { locale: id });
}
