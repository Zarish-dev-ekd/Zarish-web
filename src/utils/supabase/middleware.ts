import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminUser } from '@/lib/auth';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── STRICT ADMIN ACCESS GUARD ──
  // Only users with admin credentials/role can enter /admin
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (!isAdminUser(user)) {
      console.warn(`[Security Alert] Non-admin user ${user.email} attempted to access ${pathname}. Denied.`);
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'access-denied');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If already logged in and visiting /login or /signup, redirect appropriately
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    if (redirectParam && redirectParam.startsWith('/')) {
      if (redirectParam.startsWith('/admin') && !isAdminUser(user)) {
        return NextResponse.redirect(new URL('/account', request.url));
      }
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }

    const defaultDestination = isAdminUser(user) ? '/admin' : '/account';
    return NextResponse.redirect(new URL(defaultDestination, request.url));
  }

  return supabaseResponse;
}
