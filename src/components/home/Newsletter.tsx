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
    <section className="bg-[#FAF6F0] py-6 md:py-10" aria-labelledby="newsletter-heading">
      <div className="max-w-[480px] mx-auto text-center px-5 md:px-6">
        <h2 id="newsletter-heading" className="font-display text-xl md:text-2xl font-semibold text-[#2C1D13] mb-2">
          {heading}
        </h2>
        {description && (
          <p className="text-xs md:text-sm text-[#8C7B6B] mb-5">{description}</p>
        )}

        {status === 'success' ? (
          <p className="text-sm text-[#7B5B3A] font-semibold">
            Thank you for subscribing to ZARISH updates!
          </p>
        ) : (
          <form className="flex flex-col sm:flex-row gap-2 max-w-[380px] mx-auto" onSubmit={handleSubmit}>
            <input
              type="email"
              className="flex-1 px-4 py-2 border-[1.5px] border-[#E2D5C7] rounded-full bg-white text-xs text-[#2C1D13] placeholder-[#8C7B6B] focus:border-[#7B5B3A] focus:outline-hidden transition-colors"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address for newsletter"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-xs px-6 py-2 bg-[#3D2B1F] text-white hover:bg-[#7B5B3A] hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Subscribing...' : ctaText || 'Subscribe'}
              <IconArrowRight size={12} />
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-[#8B4E5A] text-[11px] mt-1.5">
            {errorMessage}
          </p>
        )}
      </div>
    </section>
  );
}
