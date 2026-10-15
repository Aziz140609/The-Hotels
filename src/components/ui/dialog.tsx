'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-emerald-950/85" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-gold/40 bg-emerald-800 p-6 focus:outline-none">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-gold/30 pb-4">
            <DialogPrimitive.Title className="font-serif text-3xl text-ivory">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close aria-label="Tutup dialog" className="text-gold hover:text-ivory">
              <X strokeWidth={1.25} />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
