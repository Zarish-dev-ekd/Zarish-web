'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { IconGoogle } from '@/components/icons';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${
            redirectTo && redirectTo !== '/account'
              ? `?next=${encodeURIComponent(redirectTo)}`
              : ''
          }`,
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
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

    setLoading(true);
    setError(null);

    try {
      // Create user with email pre-confirmed so no verification email is required on signup
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        }),
      });

      const signupData = await res.json();
      if (!res.ok || signupData.error) {
        throw new Error(signupData.error || 'Failed to create your account. Please try again.');
      }

      // Immediately sign in the new user
      const { data: signinData, error: signinErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signinErr) throw signinErr;

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

      if (signinData.session) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err?.message || 'Failed to create your account. Please try again.');
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-10 px-6 sm:px-10 shadow-[0_8px_30px_rgba(44,29,19,0.06)] rounded-2xl sm:rounded-3xl border border-[#E2D5C7]/80 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EBF8F2] text-[#0E7064] flex items-center justify-center text-2xl mb-4">
              ✓
            </div>
            <h2 className="font-display text-2xl font-bold text-[#2C1D13] mb-2">
              Verification Link Sent
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5744] leading-relaxed mb-6">
              We have sent a verification email to <strong className="text-[#2C1D13]">{email}</strong>.
              Please click the link inside to activate your ZARISH account.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full h-11 rounded-full bg-[#2C1D13] text-white text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center transition-all hover:bg-[#7B5B3A]"
              >
                Go to Sign In
              </Link>
              <Link
                href="/"
                className="w-full h-11 rounded-full border border-[#D9C9B8] text-[#6B5744] text-xs sm:text-sm font-semibold flex items-center justify-center transition-all hover:bg-[#FAF6F0]"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          Join the ZARISH Maison
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6B5744]">
          Create an account for seamless shopping, order tracking, and priority access.
        </p>
      </div>

      {/* Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_8px_30px_rgba(44,29,19,0.06)] rounded-2xl sm:rounded-3xl border border-[#E2D5C7]/80">
          {error && (
            <div
              className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-[#FDF8F5] border border-[#E8D5CE] text-[#6B2822] text-xs sm:text-sm flex items-start gap-3 shadow-[0_2px_12px_rgba(107,40,34,0.04)]"
              role="alert"
            >
              <div className="w-5 h-5 rounded-full bg-[#F4E2DB] text-[#6B2822] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  width="11"
                  height="11"
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

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs sm:text-sm font-medium text-[#3D2B1F] mb-1.5"
              >
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Fatima Zahra"
                className="w-full h-11 px-3.5 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white focus:ring-1 focus:ring-[#7B5B3A] transition-all"
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-[#3D2B1F] mb-1.5"
              >
                Email Address *
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
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-medium text-[#3D2B1F] mb-1.5"
              >
                Password * (min. 6 characters)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs sm:text-sm font-medium text-[#3D2B1F] mb-1.5"
              >
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white focus:ring-1 focus:ring-[#7B5B3A] transition-all"
              />
            </div>

            <p className="text-[11px] text-[#8C7B6B] leading-relaxed pt-1">
              By creating an account, you agree to ZARISH Terms of Service and Privacy Policy.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 mt-2 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all shadow-[0_4px_16px_rgba(44,29,19,0.18)] hover:shadow-[0_6px_20px_rgba(123,91,58,0.3)] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          {/* Social Sign In */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2D5C7]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#A89887] tracking-wider font-medium">
                or
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full h-11 sm:h-12 rounded-full border border-[#D9C9B8] hover:border-[#7B5B3A] bg-white hover:bg-[#FAF8F5] text-[#2C1D13] text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#7B5B3A]/30 border-t-[#7B5B3A] rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <IconGoogle size={18} />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2D5C7]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#A89887] tracking-wider font-medium">
                Already Registered?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            href={`/login${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="w-full h-11 sm:h-12 rounded-full border border-[#7B5B3A] text-[#7B5B3A] hover:bg-[#FAF6F0] text-xs sm:text-sm font-semibold tracking-wider transition-all flex items-center justify-center text-center"
          >
            Sign In with Existing Account
          </Link>
        </div>

        {/* Return link */}
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-[#7B5B3A]/30 border-t-[#7B5B3A] rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
