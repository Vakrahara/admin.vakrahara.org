import PocketBase from 'pocketbase';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.vakrahara.org';

export const pb = new PocketBase(pbUrl);

// Keep auth store synced with cookies for client routing and middleware
if (typeof window !== 'undefined') {
  // If LocalAuthStore didn't find anything in localStorage but cookie has pb_auth, load from cookie
  if (!pb.authStore.isValid && document.cookie.includes('pb_auth=')) {
    try {
      pb.authStore.loadFromCookie(document.cookie);
    } catch {
      // Invalid cookie payload, clear it
      document.cookie = 'pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; max-age=0';
    }
  }

  pb.authStore.onChange((token, record) => {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    if (pb.authStore.isValid) {
      document.cookie = pb.authStore.exportToCookie({
        httpOnly: false,
        secure: isHttps,
        sameSite: 'Lax',
        path: '/',
      });
    } else {
      // Clear cookie on sign-out across HTTPS and HTTP
      const past = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; max-age=0';
      document.cookie = `pb_auth=; ${past}; SameSite=Lax${isHttps ? '; Secure' : ''}`;
      document.cookie = `pb_auth=; ${past}`;
    }
  }, true);
}
