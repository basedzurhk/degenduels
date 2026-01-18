'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endsAt: number;
  onComplete?: () => void;
}

export function CountdownTimer({ endsAt, onComplete }: CountdownTimerProps): JSX.Element {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    function updateTimer(): void {
      const now = Date.now();
      const diff = endsAt - now;

      if (diff <= 0) {
        setTimeLeft('Completed');
        if (onComplete) {
          onComplete();
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [endsAt, onComplete]);

  return (
    <div className="text-2xl font-bold text-cyan-400">
      {timeLeft}
    </div>
  );
}
