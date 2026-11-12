'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';

interface ShuffleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  index?: number;
  total?: number;
  staggerMs?: number;
  className?: string;
}

function subscribeResize(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getMobileSnapshot() {
  return window.innerWidth < 768;
}

function getServerSnapshot() {
  return false;
}

/**
 * ShuffleCard - Staggered "shuffle & deal" entrance animation for cards
 * Triggers when card enters the viewport, with resilient fallbacks
 * so content is NEVER hidden on mobile or slow connections.
 */
export function ShuffleCard({
  children,
  index = 0,
  total = 3,
  staggerMs = 90,
  className = '',
  style = {},
  ...props
}: ShuffleCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const isMobile = useSyncExternalStore(subscribeResize, getMobileSnapshot, getServerSnapshot);

  useEffect(() => {
    // Safety fallback: Ensure card becomes visible within 350ms even if observer doesn't fire
    const safetyTimer = setTimeout(() => {
      setIsVisible(true);
    }, 350 + index * 50);

    if (!('IntersectionObserver' in window)) {
      return () => clearTimeout(safetyTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(safetyTimer);
          observer.disconnect();
        }
      },
      {
        threshold: 0.01,
        rootMargin: '120px 0px 50px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, [index]);

  // Compute shuffle offset and rotation based on position
  const delay = Math.min(index * staggerMs, 500);

  let rotationDeg = 0;
  let offsetX = 0;
  if (total > 1) {
    const normalizedPos = (index / (total - 1)) * 2 - 1; // -1 to +1
    rotationDeg = Number((normalizedPos * 3.5).toFixed(1));
    offsetX = Math.round(normalizedPos * 20);
  } else {
    rotationDeg = index % 2 === 0 ? -2 : 2;
    offsetX = index % 2 === 0 ? -12 : 12;
  }

  // On mobile screens, disable horizontal shift and rotation to avoid horizontal overflow
  const effRotation = isMobile ? 0 : rotationDeg;
  const effOffsetX = isMobile ? 0 : offsetX;
  const effOffsetY = isMobile ? 20 : 30;

  // Once animation completes, clean up transforms so native hover effects work unhindered
  useEffect(() => {
    if (isVisible && !isAnimationComplete) {
      const timer = setTimeout(() => {
        setIsAnimationComplete(true);
      }, delay + 700);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isAnimationComplete, delay]);

  const initialTransform = `translate3d(${effOffsetX}px, ${effOffsetY}px, 0) rotate(${effRotation}deg) scale(0.96)`;

  const dynamicStyle: React.CSSProperties = isAnimationComplete
    ? { ...style }
    : {
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0) rotate(0deg) scale(1)' : initialTransform,
        transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: isVisible ? 'auto' : 'transform, opacity',
      };

  return (
    <div ref={ref} className={className} style={dynamicStyle} {...props}>
      {children}
    </div>
  );
}
