'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if token/code is in query params or hash
    const establishSession = async () => {
      try {
        // Handle code query param (PKCE flow)
        const code = searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          return;
        }

        // Handle token_hash query param
        const tokenHash = searchParams.get('token_hash');
        const type = (searchParams.get('type') || 'recovery') as any;
        if (tokenHash) {
          await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          return;
        }

        // Handle hash fragment (#access_token=...&refresh_token=...)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
          }
        }
      } catch (err) {
        console.error('[Reset Password] Session extraction error:', err);
      }
    };

    establishSession();
  }, [searchParams, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      // Ensure session is set if access_token was in hash
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1800);
    } catch (err: any) {
      console.error('Password update error:', err);
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('session') || msg.toLowerCase().includes('auth') || msg.toLowerCase().includes('token')) {
        setError('This reset link is invalid or has expired. Please request a new one from the login page.');
      } else {
        setError(msg || 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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

          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2C1D13] font-display tracking-tight">
              Set New Password
            </h1>
            <p className="text-xs sm:text-sm text-[#8C7B6B] mt-1.5 leading-relaxed">
              Please enter your new password and confirm it below.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 flex items-center justify-between gap-2.5 py-2.5 px-3.5 rounded-lg bg-[#FAF6F0] border-l-[3px] border-[#874B3E] text-left animate-in fade-in duration-150">
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

          {/* Success Alert */}
          {success && (
            <div className="mb-5 flex items-center justify-between gap-2.5 py-3 px-3.5 rounded-lg bg-[#F2F7F4] border-l-[3px] border-[#0E7064] text-left animate-in fade-in duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E7064] shrink-0" />
                <span className="text-xs text-[#0E7064] font-medium leading-normal">
                  Password updated successfully! Redirecting to Admin Dashboard...
                </span>
              </div>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs sm:text-sm font-medium text-[#3D2B1F] mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full h-11 px-3.5 pr-12 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white focus:ring-1 focus:ring-[#7B5B3A] transition-all"
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs sm:text-sm font-medium text-[#3D2B1F] mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full h-11 px-3.5 pr-12 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white focus:ring-1 focus:ring-[#7B5B3A] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B6B] hover:text-[#2C1D13] transition-colors text-xs cursor-pointer"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 sm:h-12 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all shadow-[0_4px_16px_rgba(44,29,19,0.18)] hover:shadow-[0_6px_20px_rgba(123,91,58,0.3)] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>

              <div className="pt-4 text-center border-t border-[#E2D5C7]/60 mt-4">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#7B5B3A] hover:underline"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center pt-2 space-y-3">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-bold tracking-[0.14em] uppercase transition-all"
              >
                Go to Admin Dashboard
              </Link>
              <div>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#7B5B3A] hover:underline"
                >
                  Or Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-[#7B5B3A]/30 border-t-[#7B5B3A] rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
