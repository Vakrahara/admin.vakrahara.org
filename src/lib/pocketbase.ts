import PocketBase from 'pocketbase';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.vakrahara.org';

export const pb = new PocketBase(pbUrl);

// Keep auth store synced with cookies for Middleware route protection
if (typeof window !== 'undefined') {
  // Load initial store from cookie if present
  pb.authStore.onChange((token, record) => {
    if (pb.authStore.isValid) {
      document.cookie = pb.authStore.exportToCookie({ 
        secure: true, 
        sameSite: 'Lax', 
        path: '/' 
      });
    } else {
      // Clear cookie on sign-out
      document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, true);
}
