'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-[#081814]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg border border-gold/40 bg-emerald-900 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] focus:outline-none animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-gold/30 pb-4">
          <h3 className="font-serif text-2xl sm:text-3xl text-ivory tracking-wide">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="text-gold/80 transition-colors hover:text-ivory"
          >
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
