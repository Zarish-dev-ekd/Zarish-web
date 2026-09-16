'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { IconArrowRight } from '@/components/icons';

interface NewsletterProps {
  heading: string;
  description: string;
  ctaText: string;
  isActive: boolean;
}

export default function Newsletter({ heading, description, ctaText, isActive }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isActive) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email: email.trim().toLowerCase() }]);

      if (error) {
        // If unique constraint violation, still treat as success for customer UX
        if (error.code === '23505') {
          setStatus('success');
          setEmail('');
          return;
        }
        throw error;
      }

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      console.error('Newsletter error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Could not subscribe. Please try again.');
    }
  };

  return (
    <section className="bg-[#FAF6F0] py-8 md:py-12 border-t border-[#E2D5C7]/60" aria-labelledby="newsletter-heading">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">
          {/* Left Side: Content */}
          <div className="text-left max-w-xl">
            <h2 id="newsletter-heading" className="font-display text-2xl md:text-3xl font-semibold text-[#2C1D13] mb-2 tracking-wide uppercase">
              {heading}
            </h2>
            {description && (
              <p className="text-xs md:text-sm text-[#8C7B6B] leading-relaxed">{description}</p>
            )}
          </div>

          {/* Right Side: Input & Button */}
          <div className="w-full lg:w-auto shrink-0">
            {status === 'success' ? (
              <div className="p-3 bg-[#EAE2D7] rounded-full px-6 text-center">
                <p className="text-sm text-[#2C1D13] font-semibold">
                  Thank you for subscribing to ZARISH updates!
                </p>
              </div>
            ) : (
              <form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:min-w-[420px] max-w-[500px]" onSubmit={handleSubmit}>
                <input
                  type="email"
                  className="flex-1 px-5 py-3 border-[1.5px] border-[#E2D5C7] rounded-full bg-white text-xs md:text-sm text-[#2C1D13] placeholder-[#8C7B6B] focus:border-[#7B5B3A] focus:outline-hidden transition-colors shadow-xs"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address for newsletter"
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 font-medium tracking-wider uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-xs px-7 py-3 bg-[#2C1D13] text-white hover:bg-[#7B5B3A] hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 shrink-0"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Subscribing...' : ctaText || 'Subscribe'}
                  <IconArrowRight size={14} />
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="text-[#8B4E5A] text-xs mt-2 pl-3">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
