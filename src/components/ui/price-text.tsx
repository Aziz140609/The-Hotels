import { formatRupiah } from '@/lib/format';

interface PriceTextProps {
  value: number;
  suffix?: boolean;
  className?: string;
}

export function PriceText({ value, suffix = true, className = '' }: PriceTextProps) {
  return (
    <span className={`font-serif text-xl text-gold ${className}`}>
      {formatRupiah(value)}
      {suffix && <span className="font-sans text-xs font-light text-muted-ivory"> / malam</span>}
    </span>
  );
}
