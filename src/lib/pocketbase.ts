import PocketBase from 'pocketbase';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.vakrahara.org';

export const pb = new PocketBase(pbUrl);

// Keep auth store synced with cookies for Middleware route protection
if (typeof window !== 'undefined') {
  // Load initial store from cookie or localStorage fallback
  if (document.cookie.includes('pb_auth=')) {
    pb.authStore.loadFromCookie(document.cookie);
  } else {
    try {
      const stored = localStorage.getItem('pocketbase_auth');
      if (stored) pb.authStore.loadFromCookie(stored);
    } catch (e) {}
  }
  
  pb.authStore.onChange((token, record) => {
    if (pb.authStore.isValid) {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      document.cookie = pb.authStore.exportToCookie({ 
        httpOnly: false,
        secure: isHttps, 
        sameSite: 'Lax', 
        path: '/' 
      });
      try {
        localStorage.setItem('pocketbase_auth', pb.authStore.exportToCookie({ httpOnly: false, secure: isHttps, path: '/' }));
      } catch (e) {}
    } else {
      // Clear cookie on sign-out
      document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      try { localStorage.removeItem('pocketbase_auth'); } catch (e) {}
    }
  }, true);
}
