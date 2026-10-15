interface StepperProps { current: 1 | 2 | 3; }

const labels = ['Data Booking', 'Pembayaran', 'Konfirmasi'];

export function Stepper({ current }: StepperProps) {
  return <ol className="flex items-start justify-between border-b border-gold/30 pb-5">{labels.map((label, index) => { const step = (index + 1) as 1 | 2 | 3; return <li key={label} className="flex flex-col gap-2 text-center"><span className={`flex h-7 w-7 items-center justify-center border text-xs ${step <= current ? 'border-gold bg-gold text-emerald-900' : 'border-gold/40 text-muted-ivory'}`}>{step}</span><span className={`text-[10px] uppercase tracking-wide ${step <= current ? 'text-gold' : 'text-muted-ivory'}`}>{label}</span></li>; })}</ol>;
}
