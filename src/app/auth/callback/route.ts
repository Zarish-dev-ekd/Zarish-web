import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendGoogleWelcomeEmail } from '@/lib/email';
import { getRedirectBaseUrl } from '@/lib/auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/account';
  const next = rawNext.startsWith('/') ? rawNext : `/${rawNext}`;

  // Robust canonical origin resolution (mobile LAN, dev proxy, production domain)
  const baseUrl = getRedirectBaseUrl(request);

  const oauthError = searchParams.get('error_description') || searchParams.get('error');
  if (oauthError) {
    const errorRedirectUrl = new URL(
      `/login?error=${encodeURIComponent(oauthError)}`,
      baseUrl
    ).toString();
    return NextResponse.redirect(errorRedirectUrl);
  }

  if (code) {
    const destinationUrl = new URL(next, baseUrl).toString();
    const redirectResponse = NextResponse.redirect(destinationUrl);
    const cookieStore = await cookies();

    // Instantiate SSR client that sets cookies directly on the redirect response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore in server context if already committed
            }
            // CRITICAL: Bind auth cookies directly to the redirect response headers
            cookiesToSet.forEach(({ name, value, options }) =>
              redirectResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const user = data?.user ?? data?.session?.user;

      if (user) {
        const alreadySent = user.user_metadata?.welcome_email_sent === true;
        const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
        const isNewlyCreated = createdAt > 0 && Date.now() - createdAt < 15 * 60 * 1000;

        if (!alreadySent && isNewlyCreated && user.email) {
          try {
            await sendGoogleWelcomeEmail({
              to: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name,
            });

            // Update user metadata via admin client to avoid mutating session tokens/cookies
            try {
              const admin = createAdminClient();
              await admin.auth.admin.updateUserById(user.id, {
                user_metadata: {
                  ...user.user_metadata,
                  welcome_email_sent: true,
                },
              });
            } catch (adminErr) {
              console.warn('[Auth Callback] Admin metadata update skipped:', adminErr);
            }
          } catch (emailErr) {
            console.error('[Auth Callback] Welcome email error:', emailErr);
          }
        }
      }

      return redirectResponse;
    } else {
      console.error('[Auth Callback] exchangeCodeForSession failed:', error.message);
    }
  }

  const token_hash = searchParams.get('token_hash');
  const type = (searchParams.get('type') as EmailOtpType) || 'recovery';
  if (token_hash) {
    const destinationUrl = new URL(next, baseUrl).toString();
    const redirectResponse = NextResponse.redirect(destinationUrl);
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
            cookiesToSet.forEach(({ name, value, options }) =>
              redirectResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type || 'recovery' });
    if (!error) {
      return redirectResponse;
    }
  }

  // If destination was reset-password, always allow user to reach reset-password page
  if (next.includes('reset-password')) {
    return NextResponse.redirect(new URL('/reset-password', baseUrl).toString());
  }

  // Return user to login with error
  return NextResponse.redirect(new URL('/login?error=auth-code-error', baseUrl).toString());
}
