'use client';

import { useEffect, useState } from 'react';

interface CountdownProps { expiresAt: string; onExpire?: () => void; }

export function Countdown({ expiresAt, onExpire }: CountdownProps) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()));
  useEffect(() => { const timer = window.setInterval(() => setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now())), 1000); return () => window.clearInterval(timer); }, [expiresAt]);
  useEffect(() => { if (remaining === 0) onExpire?.(); }, [remaining, onExpire]);
  const minutes = Math.floor(remaining / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
  return <output aria-live="polite" className="font-serif text-2xl text-gold">{minutes}:{seconds}</output>;
}
