'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ShuffleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  index?: number;
  total?: number;
  staggerMs?: number;
  className?: string;
}

/**
 * ShuffleCard - Staggered "shuffle & deal" entrance animation for cards
 * Triggers when card enters the viewport for the first time.
 */
export function ShuffleCard({
  children,
  index = 0,
  total = 3,
  staggerMs = 120,
  className = '',
  style = {},
  ...props
}: ShuffleCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Compute shuffle offset and rotation based on position
  const delay = index * staggerMs;

  // Calculate tilt angle: fanned from left to right like dealing cards
  // E.g. for 3 cards: -3.5deg, 0deg, +3.5deg
  // For 4 cards: -4deg, -1.3deg, +1.3deg, +4deg
  let rotationDeg = 0;
  let offsetX = 0;
  if (total > 1) {
    const normalizedPos = (index / (total - 1)) * 2 - 1; // -1 to +1
    rotationDeg = Number((normalizedPos * 4).toFixed(1));
    offsetX = Math.round(normalizedPos * 28);
  } else {
    rotationDeg = index % 2 === 0 ? -2.5 : 2.5;
    offsetX = index % 2 === 0 ? -16 : 16;
  }

  const offsetY = 36;

  // Once animation completes, remove transforms so native hover effects work unhindered
  useEffect(() => {
    if (isVisible && !isAnimationComplete) {
      const timer = setTimeout(() => {
        setIsAnimationComplete(true);
      }, delay + 850);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isAnimationComplete, delay]);

  const initialTransform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotationDeg}deg) scale(0.94)`;

  const dynamicStyle: React.CSSProperties = isAnimationComplete
    ? { ...style }
    : {
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0) rotate(0deg) scale(1)' : initialTransform,
        transition: `opacity 750ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 850ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: isVisible ? 'auto' : 'transform, opacity',
      };

  return (
    <div ref={ref} className={className} style={dynamicStyle} {...props}>
      {children}
    </div>
  );
}

