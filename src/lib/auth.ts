/**
 * Centralized admin authorization constants and helpers.
 * 
 * Single source of truth for the admin email whitelist.
 * Previously duplicated in:
 *   - src/app/login/page.tsx (L23, L48)
 *   - src/app/dashboard/layout.tsx (L49)
 *   - src/proxy.ts (L54, L78)
 */

/** Whitelisted admin emails — the ONLY emails allowed to access the admin console. */
export const ADMIN_EMAILS: readonly string[] = [
  'vkarms.vk@gmail.com',
  'vakrahara@gmail.com',
] as const;

/** Check if a given email is an authorized admin. */
export function isAuthorizedAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/** Clear PocketBase auth state and the pb_auth cookie. */
export function clearAuthState(): void {
  // Dynamically import to avoid server-side issues
  try {
    document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch {
    // SSR or non-browser environment — safe to ignore
  }
}
