import { pb } from './pocketbase';

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

/**
 * Robust cross-browser auth state cleanup:
 * 1. Purges in-memory PocketBase authStore
 * 2. Purges localStorage and sessionStorage
 * 3. Force-expires cookies across all paths, domains, and HTTPS/SameSite combinations
 */
export function clearAuthState(): void {
  try {
    // 1. Clear PocketBase internal auth store
    pb.authStore.clear();

    if (typeof window !== 'undefined') {
      // 2. Clear storage keys
      try {
        window.localStorage.removeItem('pocketbase_auth');
        window.localStorage.removeItem('pb_auth');
        window.sessionStorage.clear();
      } catch {
        // Safe fallback for restricted storage environments
      }

      // 3. Clear cookie variations
      const past = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; max-age=0';
      const isHttps = window.location.protocol === 'https:';
      const secureFlag = isHttps ? '; Secure' : '';

      document.cookie = `pb_auth=; ${past}; SameSite=Lax${secureFlag}`;
      document.cookie = `pb_auth=; ${past}; SameSite=Strict${secureFlag}`;
      document.cookie = `pb_auth=; ${past}; SameSite=None${secureFlag}`;
      document.cookie = `pb_auth=; ${past}${secureFlag}`;
      document.cookie = `pb_auth=; ${past}`;

      // Domain-level cookie cleanup for subdomains
      const hostname = window.location.hostname;
      if (hostname.includes('.')) {
        const parts = hostname.split('.');
        if (parts.length >= 2) {
          const rootDomain = parts.slice(-2).join('.');
          document.cookie = `pb_auth=; ${past}; domain=.${rootDomain}; SameSite=Lax${secureFlag}`;
          document.cookie = `pb_auth=; ${past}; domain=.${rootDomain}`;
          document.cookie = `pb_auth=; ${past}; domain=.${hostname}; SameSite=Lax${secureFlag}`;
          document.cookie = `pb_auth=; ${past}; domain=.${hostname}`;
        }
      }
    }
  } catch (err) {
    console.error('[Auth] Error clearing auth state:', err);
  }
}
