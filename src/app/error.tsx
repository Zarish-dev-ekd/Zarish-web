'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Unhandled runtime error captured:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-[520px] w-full bg-white border border-[#E2D5C7] rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(44,29,19,0.06)]">
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#7B5B3A] block mb-2">
          SOMETHING UNEXPECTED OCCURRED
        </span>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13] mb-3">
          We Apologize for the Interruption
        </h1>

        <p className="text-xs sm:text-sm text-[#8C7B6B] mb-8 leading-relaxed">
          We encountered an issue loading this page. Please try refreshing or return to the storefront.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full border border-[#2C1D13] text-[#2C1D13] hover:bg-[#2C1D13] hover:text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
