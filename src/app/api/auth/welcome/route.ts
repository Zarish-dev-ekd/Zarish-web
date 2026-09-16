import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, provider } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid recipient email address is required.' },
        { status: 400 }
      );
    }

    const result = await sendWelcomeEmail({
      to: email.trim(),
      name: typeof name === 'string' ? name.trim() : null,
      provider: provider === 'google' ? 'google' : 'email',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to dispatch email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error: any) {
    console.error('[API /api/auth/welcome] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
