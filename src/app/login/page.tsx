'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === 'auth-code-error'
      ? 'Authentication link expired or invalid. Please sign in with your credentials.'
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

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105">
          <Image
            src="/logo-zarish.png"
            alt="ZARISH by Nehala Mufeed"
            width={140}
            height={50}
            className="h-10 sm:h-12 w-auto mx-auto object-contain"
            priority
          />
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13] tracking-tight">
          Welcome to ZARISH
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6B5744]">
          Sign in to access your orders, saved garments, and exclusive modest collections.
        </p>
      </div>

      {/* Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_8px_30px_rgba(44,29,19,0.06)] rounded-2xl sm:rounded-3xl border border-[#E2D5C7]/80">
          {error && (
            <div
              className="mb-6 p-3.5 rounded-xl text-xs sm:text-sm bg-[#FFF1F2] border border-[#FECDD3] text-[#9F1239] flex items-start gap-2.5"
              role="alert"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                <Link
                  href="/login?forgot=true"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!email) {
                      setError('Enter your email above and click again to receive a reset link.');
                    } else {
                      supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/auth/callback?next=/account`,
                      }).then(({ error: rErr }) => {
                        if (rErr) setError(rErr.message);
                        else setError('Password reset email sent! Check your inbox.');
                      });
                    }
                  }}
                  className="text-[11px] font-medium text-[#7B5B3A] hover:underline"
                >
                  Forgot password?
                </Link>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B6B] hover:text-[#2C1D13] transition-colors text-xs"
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
              className="w-full h-11 sm:h-12 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all shadow-[0_4px_16px_rgba(44,29,19,0.18)] hover:shadow-[0_6px_20px_rgba(123,91,58,0.3)] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2D5C7]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#A89887] tracking-wider font-medium">
                New Customer?
              </span>
            </div>
          </div>

          {/* Create Account Link */}
          <Link
            href={`/signup${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="w-full h-11 sm:h-12 rounded-full border border-[#7B5B3A] text-[#7B5B3A] hover:bg-[#FAF6F0] text-xs sm:text-sm font-semibold tracking-wider transition-all flex items-center justify-center text-center"
          >
            Create Your Account
          </Link>
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
