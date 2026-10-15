import type { HTMLAttributes } from 'react';

export function Table({ className = '', ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={`w-full text-left ${className}`} {...props} />;
}

export function TableToolbar({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col gap-4 border-b border-gold/30 pb-4 md:flex-row md:items-center md:justify-between ${className}`} {...props} />;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="flex items-center gap-3 text-xs text-muted-ivory">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} className="uppercase tracking-wide text-gold disabled:opacity-40">Sebelumnya</button>
      <span>{page} / {Math.max(totalPages, 1)}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)} className="uppercase tracking-wide text-gold disabled:opacity-40">Berikutnya</button>
    </nav>
  );
}
