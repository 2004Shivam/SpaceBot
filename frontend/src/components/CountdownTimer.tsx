import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  targetDate: string;
}

export const CountdownTimer: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculate = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
        <Clock size={13} /> Liftoff Complete
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: 'var(--bg-surface)',
      padding: '5px 10px',
      borderRadius: '6px',
      border: '1px solid var(--border-card)',
      fontFamily: 'var(--font-mono)',
      color: 'var(--accent-primary)',
      fontSize: '0.82rem',
    }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>T-</span>
      {timeLeft.days > 0 && (
        <>
          <span style={{ fontWeight: 700 }}>{timeLeft.days}d</span>
          <span style={{ opacity: 0.4 }}>:</span>
        </>
      )}
      <span style={{ fontWeight: 700 }}>{pad(timeLeft.hours)}h</span>
      <span style={{ opacity: 0.4 }}>:</span>
      <span style={{ fontWeight: 700 }}>{pad(timeLeft.minutes)}m</span>
      <span style={{ opacity: 0.4 }}>:</span>
      <span style={{ fontWeight: 700, minWidth: '20px' }}>{pad(timeLeft.seconds)}s</span>
    </div>
  );
};
