import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendGoogleWelcomeEmail } from '@/lib/email';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/account';
  const next = rawNext.startsWith('/') ? rawNext : `/${rawNext}`;

  const oauthError = searchParams.get('error_description') || searchParams.get('error');
  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(oauthError)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const user = data?.user ?? data?.session?.user;

      if (user) {
        // Check if welcome email was already sent
        const alreadySent = user.user_metadata?.welcome_email_sent === true;

        // Verify newly created account (created within the last 15 minutes)
        const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
        const isNewlyCreated = createdAt > 0 && Date.now() - createdAt < 15 * 60 * 1000;

        if (!alreadySent && isNewlyCreated && user.email) {
          try {
            await sendGoogleWelcomeEmail({
              to: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name,
            });

            // Mark welcome email as sent so it won't be sent on subsequent logins
            await supabase.auth.updateUser({
              data: { welcome_email_sent: true },
            });
          } catch (emailErr) {
            console.error('[Auth Callback] Welcome email error:', emailErr);
          }
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as any;
  if (token_hash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type || 'recovery' });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If destination was reset-password, always allow user to reach reset-password page
  if (next.includes('reset-password')) {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  // Return user to an error page or login with error
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
