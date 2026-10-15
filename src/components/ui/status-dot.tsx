interface StatusDotProps {
  label: string;
  color?: 'gold' | 'success' | 'info' | 'muted' | 'danger';
}

const colorClasses = {
  gold: 'bg-gold',
  success: 'bg-success',
  info: 'bg-info',
  muted: 'bg-muted',
  danger: 'bg-danger',
};

export function StatusDot({ label, color = 'muted' }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-light text-muted-ivory">
      <span aria-hidden="true" className={`h-1.5 w-1.5 ${colorClasses[color]}`} />
      {label}
    </span>
  );
}
