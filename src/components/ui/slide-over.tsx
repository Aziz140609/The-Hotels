import type { HTMLAttributes } from 'react';

export function SlideOver({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <aside className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-gold/30 bg-emerald-800 p-6 ${className}`} {...props} />;
}
