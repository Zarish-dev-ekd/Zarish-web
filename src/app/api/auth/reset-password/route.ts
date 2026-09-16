import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        {
          title: 'Invalid Email Address',
          error: 'Please enter a valid email address to receive a password reset link.',
          code: 'INVALID_EMAIL',
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const redirectTo = `${origin}/reset-password`;

    // ── APPROACH 1: If Service Role Key is configured, generate recovery link & send via Brevo ──
    if (serviceRoleKey) {
      console.log('[Password Reset] Using Supabase Admin + Brevo email delivery for:', email);
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      });

      if (linkError) {
        console.warn('[Password Reset] Supabase Admin error:', linkError.message);
        const msg = linkError.message.toLowerCase();
        if (msg.includes('not found') || msg.includes('user') || linkError.status === 404 || linkError.status === 400) {
          return NextResponse.json(
            {
              title: 'Account Not Registered',
              error: 'This email is not registered in our database. Please check your email address or contact the administrator.',
              code: 'NOT_REGISTERED',
            },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            title: 'Unable to Send Link',
            error: linkError.message || 'Unable to generate reset link.',
            code: 'ERROR',
          },
          { status: 400 }
        );
      }

      const actionLink = linkData?.properties?.action_link;
      if (actionLink) {
        const emailResult = await sendPasswordResetEmail({
          to: email,
          resetUrl: actionLink,
        });

        if (!emailResult.success) {
          console.error('[Password Reset] Brevo failed to send email:', emailResult.error);
          return NextResponse.json(
            {
              title: 'Email Delivery Error',
              error: 'Failed to send reset email. Please try again or contact support.',
              code: 'EMAIL_FAILED',
            },
            { status: 500 }
          );
        }

        console.log('[Password Reset] Successfully sent reset email via Brevo to:', email);
        return NextResponse.json({
          success: true,
          title: 'Reset Link Sent',
          message: 'Password reset link sent! Please check your inbox.',
        });
      }
    }

    // ── APPROACH 2: Standard Supabase Client resetPasswordForEmail ──
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Password Reset] Sending reset email via standard Supabase auth to:', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error('[Password Reset] Supabase resetPasswordForEmail error:', error);
      const msg = error.message?.toLowerCase() || '';

      // If rate limited by Supabase (already dispatched recently), do not restrict or block with error
      if (
        msg.includes('rate') ||
        msg.includes('too many') ||
        msg.includes('over_email_send_rate_limit') ||
        error.status === 429
      ) {
        return NextResponse.json({
          success: true,
          title: 'Reset Link Sent',
          message: 'Password reset link sent! Please check your inbox.',
        });
      }

      // Check if user is not registered in the database
      if (
        msg.includes('user not found') ||
        msg.includes('not found') ||
        msg.includes('signups not allowed') ||
        msg.includes('invalid email') ||
        error.status === 400 ||
        error.status === 404 ||
        error.status === 422
      ) {
        return NextResponse.json(
          {
            title: 'Account Not Registered',
            error: 'This email is not registered in our database. Please check your email address or contact the administrator.',
            code: 'NOT_REGISTERED',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          title: 'Unable to Send Link',
          error: error.message || 'Unable to send reset link. Please try again.',
          code: 'ERROR',
        },
        { status: 400 }
      );
    }

    console.log('[Password Reset] Supabase accepted reset request for:', email);
    return NextResponse.json({
      success: true,
      title: 'Reset Link Sent',
      message: 'Password reset link sent! Please check your inbox.',
    });
  } catch (err: any) {
    console.error('[API /api/auth/reset-password] Unexpected Error:', err);
    return NextResponse.json(
      {
        title: 'Connection Error',
        error: err?.message || 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
