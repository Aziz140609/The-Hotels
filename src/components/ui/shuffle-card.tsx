import React from 'react';

interface ShuffleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  index?: number;
  total?: number;
  staggerMs?: number;
  className?: string;
}

/**
 * ShuffleCard - Staggered entrance animation for cards
 * Uses pure CSS animation so content is ALWAYS rendered and visible
 * across all devices, mobile browsers, and network conditions.
 */
export function ShuffleCard({
  children,
  index = 0,
  staggerMs = 80,
  className = '',
  style = {},
  ...props
}: ShuffleCardProps) {
  const delay = Math.min(index * staggerMs, 400);

  return (
    <div
      className={`shuffle-card-animate ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
