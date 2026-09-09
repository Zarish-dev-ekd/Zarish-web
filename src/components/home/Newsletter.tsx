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
    <section className="newsletter section" aria-labelledby="newsletter-heading">
      <div className="newsletter__inner">
        <h2 id="newsletter-heading" className="newsletter__title">
          {heading}
        </h2>
        {description && (
          <p className="newsletter__description">{description}</p>
        )}

        {status === 'success' ? (
          <p className="body-lg" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Thank you for subscribing to ZARISH updates!
          </p>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="newsletter__input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address for newsletter"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              className="btn btn--primary"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Subscribing...' : ctaText || 'Subscribe'}
              <IconArrowRight size={14} />
            </button>
          </form>
        )}

        {status === 'error' && (
          <p style={{ color: 'var(--color-burgundy)', fontSize: '13px', marginTop: '8px' }}>
            {errorMessage}
          </p>
        )}
      </div>
    </section>
  );
}
