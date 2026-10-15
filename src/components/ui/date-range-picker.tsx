import { type InputHTMLAttributes } from 'react';
import { CalendarDays } from 'lucide-react';

interface DateRangePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function DateRangePicker({ label, className = '', ...props }: DateRangePickerProps) {
  return <label className={`block border-b border-gold/50 pb-2 ${className}`}><span className="text-[11px] font-medium uppercase tracking-label text-gold">{label}</span><span className="mt-2 flex items-center justify-between gap-2"><input type="date" className="min-w-0 bg-transparent font-serif text-lg text-ivory outline-none [color-scheme:dark]" {...props} /><CalendarDays className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.25} /></span></label>;
}
