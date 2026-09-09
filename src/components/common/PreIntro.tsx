'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIntroSeen } from '@/hooks/use-intro-seen';

interface PreIntroProps {
  subtitle?: string;
}

export default function PreIntro({
  subtitle = 'HAUTE COUTURE MODEST FASHION',
}: PreIntroProps) {
  const { markSeen } = useIntroSeen('zarish_intro_seen', 'session');
  const [phase, setPhase] = useState(0);
  const [hidden, setHidden] = useState(false);

  const completeIntro = useCallback(() => {
    try {
      markSeen();
      var s = document.getElementById('zarish-suppress-intro');
      if (!s) {
        s = document.createElement('style');
        s.id = 'zarish-suppress-intro';
        s.textContent = '#zarish-preintro{display:none!important}';
        document.head.appendChild(s);
      }
    } catch {
      // ignore
    }
    setHidden(true);
  }, [markSeen]);

  const handleSkip = useCallback(() => {
    // Initiate quick slide-up on user click
    setPhase(4);
    setTimeout(() => {
      completeIntro();
    }, 450);
  }, [completeIntro]);

  useEffect(() => {
    // Immediate check on client mount
    try {
      if (sessionStorage.getItem('zarish_intro_seen') === 'true') {
        setHidden(true);
        return;
      }
    } catch {
      // ignore
    }

    // Step-by-step luxury timeline
    const t1 = setTimeout(() => setPhase(1), 120);  // Logo blooms in with warm glow
    const t2 = setTimeout(() => setPhase(2), 500);  // Gold accent bar expands
    const t3 = setTimeout(() => setPhase(3), 800);  // Subtitle reveals
    const t4 = setTimeout(() => setPhase(4), 1600); // Slide-up curtain reveal starts
    const t5 = setTimeout(() => {
      completeIntro();
    }, 2450); // Complete removal

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [completeIntro]);

  // Click or keypress anywhere to skip
  useEffect(() => {
    if (hidden) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleSkip();
      }
    };
    window.addEventListener('click', handleSkip);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', handleSkip);
      window.removeEventListener('keydown', onKey);
    };
  }, [hidden, handleSkip]);

  if (hidden) return null;

  return (
    <div
      id="zarish-preintro"
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#FAF6F0] overflow-hidden select-none cursor-pointer will-change-transform"
      style={{
        transform: phase >= 4 ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.5s ease',
        pointerEvents: phase >= 4 ? 'none' : 'auto',
      }}
      aria-label="Welcome to ZARISH"
      role="dialog"
      aria-modal="true"
    >
      {/* ─── Ambient Warm Golden Aura (Light Brand Theme) ───────── */}
      <div
        className={`absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22)_0%,rgba(240,228,216,0.55)_45%,transparent_70%)] blur-2xl pointer-events-none transition-all duration-1000 ${
          phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
      />

      {/* ─── Center Content ────────────────────────────────────── */}
      <div
        className={`relative z-20 flex flex-col items-center gap-4 px-6 text-center transition-all duration-700 ${
          phase >= 4 ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
        }`}
      >
        {/* ZARISH Brand Logo in Natural Luxury Bronze with Warm Champagne Glow */}
        <div
          className="relative transition-all duration-700 ease-out flex items-center justify-center"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.94)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-zarish.png"
            alt="ZARISH by Nehala Mufeed"
            className="w-56 sm:w-72 md:w-84 h-auto object-contain filter drop-shadow-[0_4px_20px_rgba(123,91,58,0.18)] drop-shadow-[0_0_35px_rgba(212,175,55,0.25)]"
          />
        </div>

        {/* Expanding Gold Divider Line */}
        <div
          className="w-16 sm:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#C8A97E] to-transparent my-1 transition-transform duration-500 ease-out"
          style={{
            transform: phase >= 2 ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'center',
          }}
        />

        {/* Luxury Subtitle with Elegant Tracking */}
        <div
          className="overflow-hidden transition-all duration-500 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(6px)',
          }}
        >
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#7B5B3A]">
            {subtitle}
          </p>
        </div>
      </div>

      {/* ─── Skip Hint ────────────────────────────────────────── */}
      <div
        className={`absolute bottom-6 z-20 text-[10px] tracking-[0.22em] uppercase text-[#8C7B6B] transition-opacity duration-300 ${
          phase >= 4 ? 'opacity-0' : 'opacity-70 hover:opacity-100'
        }`}
      >
        Click anywhere to skip
      </div>
    </div>
  );
}
