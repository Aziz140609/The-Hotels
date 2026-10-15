import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/85 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="relative w-full max-w-lg border border-gold/40 bg-emerald-800 p-6">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-gold/30 pb-4">
          <h2 id="dialog-title" className="font-serif text-3xl text-ivory">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup dialog" className="text-gold hover:text-ivory"><X strokeWidth={1.25} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}
