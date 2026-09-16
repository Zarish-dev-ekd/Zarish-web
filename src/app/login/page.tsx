'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/admin';
  const urlError = searchParams.get('error');
  const urlMessage = searchParams.get('message');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<{ title: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    urlMessage ? decodeURIComponent(urlMessage) : null
  );
  const [error, setError] = useState<string | null>(
    urlError === 'auth-code-error'
      ? 'Authentication link expired or invalid. Please sign in with your credentials.'
      : urlError
      ? decodeURIComponent(urlError)
      : null
  );

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authErr) {
        throw authErr;
      }

      if (data.session) {
        // Successful login
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      let msg = err?.message || 'Invalid email or password.';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        msg = 'Incorrect email or password. Please check your credentials or create an account.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setResetError({
        title: 'Email Required',
        message: 'Please enter your email address to receive a reset link.',
      });
      return;
    }

    setResetLoading(true);
    setResetError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || 'This email is not registered in our database.';
        let title = data.title;
        if (!title) {
          const lower = msg.toLowerCase();
          if (lower.includes('not registered') || lower.includes('not found')) {
            title = 'Account Not Registered';
          } else {
            title = 'Unable to Send Link';
          }
        }
        setResetError({ title, message: msg });
        return;
      }

      setResetSent(true);
      setSuccessMessage(data.message || 'Password reset link sent! Please check your inbox.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setResetError({
        title: 'Connection Error',
        message: err?.message || 'Failed to connect. Please check your network connection.',
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Card Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_8px_30px_rgba(44,29,19,0.06)] rounded-2xl sm:rounded-3xl border border-[#E2D5C7]/80">
          {/* Brand Logo inside card */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/logo-zarish.png"
                alt="ZARISH by Nehala Mufeed"
                width={140}
                height={50}
                className="h-10 sm:h-11 w-auto mx-auto object-contain"
                priority
              />
            </Link>
          </div>

          {viewMode === 'login' ? (
            /* ── Sign In Form ── */
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Sleek Minimalist Login Error */}
              {error && (
                <div className="flex items-center justify-between gap-2.5 py-2.5 px-3.5 rounded-lg bg-[#FAF6F0] border-l-[3px] border-[#874B3E] text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#874B3E] shrink-0" />
                    <span className="text-xs text-[#3D2B1F] font-medium leading-normal">
                      {error}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-[#8C7B6B] hover:text-[#2C1D13] text-xs p-1 shrink-0 cursor-pointer"
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Sleek Minimalist Login Success */}
              {successMessage && (
                <div className="flex items-center justify-between gap-2.5 py-2.5 px-3.5 rounded-lg bg-[#F2F7F4] border-l-[3px] border-[#0E7064] text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0E7064] shrink-0" />
                    <span className="text-xs text-[#0E7064] font-medium leading-normal">
                      {successMessage}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuccessMessage(null)}
                    className="text-[#0E7064]/60 hover:text-[#0E7064] text-xs p-1 shrink-0 cursor-pointer"
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-[#3D2B1F] mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white focus:ring-1 focus:ring-[#7B5B3A] transition-all"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-medium text-[#3D2B1F]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot');
                      setError(null);
                      setResetError(null);
                      setSuccessMessage(null);
                      setResetSent(false);
                    }}
                    className="text-[11px] font-medium text-[#7B5B3A] hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white focus:ring-1 focus:ring-[#7B5B3A] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B6B] hover:text-[#2C1D13] transition-colors text-xs cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#7B5B3A] border-[#D9C9B8] focus:ring-[#7B5B3A]"
                  />
                  <span className="text-xs text-[#6B5744]">Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 sm:h-12 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all shadow-[0_4px_16px_rgba(44,29,19,0.18)] hover:shadow-[0_6px_20px_rgba(123,91,58,0.3)] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            /* ── Forgot Password Form ── */
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-base sm:text-lg font-bold text-[#2C1D13] font-display tracking-tight">
                  Reset Password
                </h2>
                <p className="text-xs text-[#8C7B6B] mt-1 leading-relaxed">
                  Enter your email address and we&apos;ll send you a secure link to reset your password.
                </p>
              </div>

              {/* Sleek Minimalist Reset Error */}
              {resetError && (
                <div className="flex items-center justify-between gap-2.5 py-2.5 px-3.5 rounded-lg bg-[#FAF6F0] border-l-[3px] border-[#874B3E] text-left animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#874B3E] shrink-0" />
                    <span className="text-xs text-[#3D2B1F] font-medium leading-normal">
                      {resetError.message}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetError(null)}
                    className="text-[#8C7B6B] hover:text-[#2C1D13] text-xs p-1 shrink-0 cursor-pointer"
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Sleek Minimalist Reset Success */}
              {successMessage && (
                <div className="flex items-center justify-between gap-2.5 py-2.5 px-3.5 rounded-lg bg-[#F2F7F4] border-l-[3px] border-[#0E7064] text-left animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0E7064] shrink-0" />
                    <span className="text-xs text-[#0E7064] font-medium leading-normal">
                      {successMessage}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuccessMessage(null)}
                    className="text-[#0E7064]/60 hover:text-[#0E7064] text-xs p-1 shrink-0 cursor-pointer"
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              {!resetSent ? (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-xs sm:text-sm font-medium text-[#3D2B1F] mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (resetError) setResetError(null);
                      }}
                      placeholder="name@example.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white focus:ring-1 focus:ring-[#7B5B3A] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-11 sm:h-12 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all shadow-[0_4px_16px_rgba(44,29,19,0.18)] hover:shadow-[0_6px_20px_rgba(123,91,58,0.3)] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {resetLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center pt-2">
                  <p className="text-xs text-[#6B5744] mb-4">
                    Didn&apos;t receive the email? Check your spam folder or try again.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSent(false);
                      setSuccessMessage(null);
                      setResetError(null);
                    }}
                    className="text-xs font-semibold text-[#7B5B3A] hover:underline cursor-pointer"
                  >
                    Send another link
                  </button>
                </div>
              )}

              <div className="pt-2 text-center border-t border-[#E2D5C7]/60">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setError(null);
                    setResetError(null);
                    setSuccessMessage(null);
                    setResetSent(false);
                  }}
                  className="text-xs font-semibold text-[#7B5B3A] hover:text-[#2C1D13] transition-colors inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                >
                  <span>← Back to Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back to Home link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#8C7B6B] hover:text-[#2C1D13] transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Return to ZARISH Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-[#7B5B3A]/30 border-t-[#7B5B3A] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
