import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: 'Please enter your full name.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Create user with email_confirm: true so no verification email is required on signup
    // Create user with email_confirm: true and customer role (non-admin)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        name: fullName,
        role: 'customer',
        is_admin: false,
      },
      app_metadata: {
        role: 'customer',
        is_admin: false,
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes('already registered') ||
        msg.includes('already exists') ||
        msg.includes('unique') ||
        error.status === 422
      ) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 400 }
        );
      }

      console.error('[Signup API] Error creating user:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create account.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
    });
  } catch (err: any) {
    console.error('[Signup API] Unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process account creation.' },
      { status: 500 }
    );
  }
}
