export interface UserLike {
  email?: string | null;
  app_metadata?: Record<string, any> | null;
  user_metadata?: Record<string, any> | null;
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
    'zarish2025co@gmail.com,mrithulmridhu@gmail.com,eethanop@gmail.com';

  const adminEmails = rawAdminEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = user.email.trim().toLowerCase();

  if (adminEmails.includes(email)) {
    return true;
  }

  // 2. Check Supabase app_metadata (set only by server/service role)
  if (
    user.app_metadata?.role === 'admin' ||
    user.app_metadata?.is_admin === true
  ) {
    return true;
  }

  // 3. Check Supabase user_metadata
  if (
    user.user_metadata?.role === 'admin' ||
    user.user_metadata?.is_admin === true
  ) {
    return true;
  }

  return false;
}
