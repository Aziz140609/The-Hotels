import type { ReactNode } from 'react';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border-y border-gold/30 px-6 py-16 text-center">
      <h2 className="font-serif text-3xl font-normal text-ivory">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-light leading-6 text-muted-ivory">
        {description}
      </p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}

export { Button };
