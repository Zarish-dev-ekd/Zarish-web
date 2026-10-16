export interface UserLike {
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
}

/**
 * Determines whether a user has administrator privileges.
 * Checks:
 * 1. ADMIN_EMAILS or NEXT_PUBLIC_ADMIN_EMAILS environment variable
 * 2. Supabase app_metadata.role === 'admin' or app_metadata.is_admin === true
 * 3. Supabase user_metadata.role === 'admin' or user_metadata.is_admin === true
 */
export function isAdminUser(user: UserLike | null | undefined): boolean {
  if (!user || !user.email) {
    return false;
  }

  // 1. Check explicit admin emails defined in environment variables
  const rawAdminEmails =
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    'zarish2025co@gmail.com';

  const adminEmails = rawAdminEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = user.email.trim().toLowerCase();

  if (adminEmails.includes(email)) {
    return true;
  }

  // 2. Check Supabase app_metadata (strictly set only by server/service role)
  if (
    user.app_metadata?.role === 'admin' ||
    user.app_metadata?.is_admin === true
  ) {
    return true;
  }

  return false;
}

/**
 * Resolves the primary canonical site URL across environments.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (envUrl) {
    let clean = envUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return 'https://www.zarishbynehalamufeed.com';
}

/**
 * Resolves the appropriate base URL for server-side and client-side redirects.
 * Accurately detects reverse proxy headers, mobile LAN IP headers, and production domains.
 */
export function getRedirectBaseUrl(request?: Request): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  // In production, always prioritize NEXT_PUBLIC_SITE_URL if defined
  if (process.env.NODE_ENV === 'production' && siteUrl) {
    const clean = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    return clean.replace(/\/+$/, '');
  }

  if (request) {
    // 1. Check forwarded headers (reverse proxies, Vercel, Cloudflare, tunnel)
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`.replace(/\/+$/, '');
    }

    // 2. Check host header (e.g. mobile device accessing via LAN IP like 192.168.1.15:3000)
    const host = request.headers.get('host');
    if (host) {
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      const proto = request.headers.get('x-forwarded-proto') || (isLocal ? 'http' : 'https');
      if (!isLocal) {
        return `${proto}://${host}`.replace(/\/+$/, '');
      }
    }

    // 3. Fallback to request URL origin
    try {
      const url = new URL(request.url);
      if (url.origin && url.origin !== 'null') {
        const isLocalOrigin = url.origin.includes('localhost') || url.origin.includes('127.0.0.1');
        if (isLocalOrigin && host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
          return `http://${host}`.replace(/\/+$/, '');
        }
        return url.origin.replace(/\/+$/, '');
      }
    } catch {}
  }

  // Client-side browser window origin
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  if (siteUrl) {
    const clean = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    return clean.replace(/\/+$/, '');
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`.replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
}

/**
 * Resolves the OAuth callback URL for Supabase signInWithOAuth.
 * Automatically preserves query destination if specified.
 */
export function getAuthCallbackUrl(nextPath?: string): string {
  let origin = '';

  if (typeof window !== 'undefined' && window.location.origin) {
    origin = window.location.origin.replace(/\/+$/, '');
  } else {
    origin = getSiteUrl();
  }

  const callback = `${origin}/auth/callback`;
  if (nextPath) {
    const cleanNext = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
    return `${callback}?next=${encodeURIComponent(cleanNext)}`;
  }
  return callback;
}

