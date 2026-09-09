'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIntroSeen } from '@/hooks/use-intro-seen';

interface PreIntroProps {
  subtitle?: string;
}

export default function PreIntro({
  subtitle = 'HAUTE COUTURE MODEST FASHION',
}: PreIntroProps) {
  const { seen, markSeen } = useIntroSeen('zarish_intro_seen', 'session');
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!seen) {
      setMounted(true);
      const t1 = setTimeout(() => setPhase(1), 250);  // Logo blooms in with gold glow
      const t2 = setTimeout(() => setPhase(2), 650);  // Expanding gold divider line
      const t3 = setTimeout(() => setPhase(3), 950);  // Subtitle staggers in
      const t4 = setTimeout(() => setPhase(4), 1600); // Split curtain doors glide open
      const t5 = setTimeout(() => {
        markSeen();
        setMounted(false);
      }, 2350); // Unmount after doors are fully parted

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
      };
    } else {
      setMounted(false);
    }
  }, [seen, markSeen]);

  // Allow visitor to skip by clicking or pressing any key
  const handleSkip = useCallback(() => {
    markSeen();
    setMounted(false);
  }, [markSeen]);

  useEffect(() => {
    if (!mounted) return;
    window.addEventListener('click', handleSkip);
    window.addEventListener('keydown', handleSkip);
    return () => {
      window.removeEventListener('click', handleSkip);
      window.removeEventListener('keydown', handleSkip);
    };
  }, [mounted, handleSkip]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden select-none cursor-pointer transition-opacity duration-400 ${
        phase >= 4 ? 'pointer-events-none' : ''
      }`}
      aria-label="Welcome to ZARISH"
      role="dialog"
      aria-modal="true"
    >
      {/* ─── Split-Curtain Boutique Doors (Left & Right) ─────── */}
      {/* Left Door */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#0A0806] z-10 will-change-transform"
        style={{
          transform: phase >= 4 ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.75s cubic-bezier(0.76, 0, 0.24, 1)',
        }}
      />
      {/* Right Door */}
      <div
        className="absolute top-0 bottom-0 left-1/2 w-1/2 bg-[#0A0806] z-10 will-change-transform"
        style={{
          transform: phase >= 4 ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.75s cubic-bezier(0.76, 0, 0.24, 1)',
        }}
      />

      {/* ─── Central Brand Showcase ────────────────────────────── */}
      <div
        className={`relative z-20 flex flex-col items-center gap-4 px-6 text-center transition-all duration-700 ${
          phase >= 4 ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Ambient Radial Golden Glow behind Logo */}
        <div
          className={`absolute w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.25)_0%,rgba(139,78,90,0.15)_40%,transparent_70%)] blur-2xl pointer-events-none transition-all duration-1000 ${
            phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        />

        {/* ZARISH Brand Logo with Radiant Glow */}
        <div
          className="relative transition-all duration-700 ease-out flex items-center justify-center"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.92)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-zarish.png"
            alt="ZARISH by Nehala Mufeed"
            className="w-56 sm:w-72 md:w-80 h-auto object-contain filter drop-shadow-[0_0_22px_rgba(212,175,55,0.55)] drop-shadow-[0_0_55px_rgba(200,169,126,0.35)] invert brightness-0 [filter:brightness(0)_invert(1)_drop-shadow(0_0_25px_rgba(212,175,55,0.6))_drop-shadow(0_0_50px_rgba(200,169,126,0.35))]"
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
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <p className="text-[10px] sm:text-xs font-medium tracking-[0.32em] uppercase text-[#C8A97E] drop-shadow-[0_1px_10px_rgba(200,169,126,0.4)]">
            {subtitle}
          </p>
        </div>
      </div>

      {/* ─── Skip Hint ────────────────────────────────────────── */}
      <div
        className={`absolute bottom-6 z-20 text-[10px] tracking-[0.22em] uppercase text-[#666666] transition-opacity duration-300 ${
          phase >= 4 ? 'opacity-0' : 'opacity-70 hover:opacity-100'
        }`}
      >
        Click anywhere to skip
      </div>
    </div>
  );
}
