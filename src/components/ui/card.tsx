import { forwardRef, type HTMLAttributes } from 'react';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`border border-gold/30 bg-emerald-800 ${className}`} {...props} />
  )
);

Card.displayName = 'Card';

export { Card };
