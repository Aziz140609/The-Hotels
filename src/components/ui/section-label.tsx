interface SectionLabelProps {
  label: string;
  title: string;
  light?: boolean;
  className?: string;
}

export function SectionLabel({
  label,
  title,
  light = false,
  className = '',
}: SectionLabelProps) {
  const color = light ? 'text-ivory' : 'text-emerald-900';
  return (
    <div className={className}>
      <p className={`text-[11px] font-medium uppercase tracking-label text-gold`}>
        {label}
      </p>
      <h2 className={`mt-2 font-serif text-4xl font-normal md:text-5xl ${color}`}>
        {title}
      </h2>
    </div>
  );
}
