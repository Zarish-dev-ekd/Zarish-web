'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { IconGoogle, IconX } from '@/components/icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signin',
}: AuthModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Sync mode with initialMode when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSignupSuccess(false);
    }
  }, [isOpen, initialMode]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthErr) {
        throw oauthErr;
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err?.message || 'Failed to initialize Google sign in.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (authErr) throw authErr;

        if (data.session) {
          onClose();
          router.refresh();
        }
      } else {
        const { data, error: authErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authErr) throw authErr;

        // Dispatch welcome email via Brevo
        try {
          await fetch('/api/auth/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim(),
              name: fullName.trim(),
              provider: 'email',
            }),
          });
        } catch (welcomeErr) {
          console.error('Welcome email dispatch error:', welcomeErr);
        }

        if (data.session) {
          onClose();
          router.refresh();
        } else {
          setSignupSuccess(true);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err?.message || 'An error occurred during authentication.';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        msg = 'Incorrect email or password. Please try again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E2D5C7] overflow-hidden my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Centered Logo & Close button */}
        <div className="px-6 py-4 border-b border-[#F5EDE3] flex items-center justify-center shrink-0 bg-white z-10 relative">
          <Image
            src="/logo-zarish.png"
            alt="ZARISH by Nehala Mufeed"
            width={130}
            height={32}
            style={{ height: '28px', width: 'auto' }}
            priority
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FAF6F0] text-[#6B5744] hover:text-[#2C1D13] hover:bg-[#F5EDE3] flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {signupSuccess ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EBF8F2] text-[#0E7064] flex items-center justify-center text-xl mb-3">
                ✓
              </div>
              <h4 className="font-display text-lg font-bold text-[#2C1D13] mb-1.5">
                Verification Email Sent
              </h4>
              <p className="text-xs sm:text-sm text-[#6B5744] leading-relaxed mb-5">
                We have sent a verification link to <strong className="text-[#2C1D13]">{email}</strong>. Please check your inbox to activate your account.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSignupSuccess(false);
                  setMode('signin');
                }}
                className="w-full h-11 rounded-full bg-[#2C1D13] text-white text-xs font-bold tracking-wider uppercase hover:bg-[#7B5B3A] transition-all"
              >
                Continue to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-2xl bg-[#FDF8F5] border border-[#E8D5CE] text-[#6B2822] text-xs flex items-start gap-2.5 shadow-[0_2px_8px_rgba(107,40,34,0.04)]">
                  <div className="w-4 h-4 rounded-full bg-[#F4E2DB] text-[#6B2822] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full h-10 sm:h-11 rounded-full border border-[#D9C9B8] hover:border-[#7B5B3A] bg-white hover:bg-[#FAF8F5] text-[#2C1D13] text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mb-3"
              >
                {googleLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#7B5B3A]/30 border-t-[#7B5B3A] rounded-full animate-spin" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <IconGoogle size={17} />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2D5C7]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-[#A89887] tracking-wider text-[10px] font-medium">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-[#3D2B1F] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Fatima Zahra"
                      className="w-full h-9 sm:h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#3D2B1F] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-9 sm:h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#3D2B1F] mb-1">
                    Password * {mode === 'signup' && '(min. 6 characters)'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-9 sm:h-10 px-3 pr-10 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B6B] hover:text-[#2C1D13] text-[11px]"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-[#3D2B1F] mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-9 sm:h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-all"
                    />
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full h-10 sm:h-11 mt-1 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-bold tracking-[0.12em] uppercase transition-all shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              {/* Mode Toggle footer */}
              <div className="mt-4 pt-3.5 border-t border-[#F5EDE3] text-center pb-1">
                {mode === 'signin' ? (
                  <p className="text-xs text-[#6B5744]">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                      }}
                      className="font-semibold text-[#7B5B3A] hover:underline"
                    >
                      Create account
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-[#6B5744]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError(null);
                      }}
                      className="font-semibold text-[#7B5B3A] hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
