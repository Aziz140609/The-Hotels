interface GoldDividerProps { className?: string; }

export function GoldDivider({ className = '' }: GoldDividerProps) {
  return <div aria-hidden="true" className={`h-px w-16 bg-gold ${className}`} />;
}
