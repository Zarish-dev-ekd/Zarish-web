'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // Clear any existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Start: show bar at 0
    setProgress(5);
    setVisible(true);

    // Quickly ramp to ~80% to simulate loading
    let current = 5;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 12 + 6;
      if (current >= 85) {
        current = 85;
        clearInterval(intervalRef.current!);
      }
      setProgress(current);
    }, 120);

    // After pathname changes (page mounted), complete the bar
    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!);
      setProgress(100);
      // Fade out after completion
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
    }, 350);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-[2.5px] bg-gradient-to-r from-[#7B5B3A] via-[#C4917B] to-[#8B4E5A] rounded-full transition-all"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transition: progress === 100
            ? 'width 200ms ease-out, opacity 350ms ease 200ms'
            : 'width 200ms ease-out',
        }}
      />
    </div>
  );
}
