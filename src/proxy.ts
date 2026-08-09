import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes (everything under /dashboard)
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Read PocketBase auth cookie
  const cookieValue = request.cookies.get('pb_auth')?.value;

  if (isDashboardRoute) {
    if (!cookieValue) {
      // Not authenticated, redirect to login with original target redirect param
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode JWT token structure safely
      // A standard cookie exported by pb.authStore.exportToCookie() is like:
      // pb_auth={"token":"...","model":{...}}
      // Let's parse the JSON cookie first.
      const decodedCookie = decodeURIComponent(cookieValue);
      const authData = JSON.parse(decodedCookie);
      
      const token = authData.token;
      const model = authData.model;

      if (!token || !model) {
        throw new Error('Invalid auth cookie structure');
      }

      // Decode the JWT token payload (middle segment)
      const tokenPayloadBase64 = token.split('.')[1];
      if (!tokenPayloadBase64) {
        throw new Error('Malformed token');
      }

      // Use modern Web standard atob for base64 decoding in Edge middleware
      const tokenPayloadDecoded = atob(tokenPayloadBase64);
      const jwtPayload = JSON.parse(tokenPayloadDecoded);

      // Verify expiration (exp is in seconds)
      const currentTimestampSeconds = Math.floor(Date.now() / 1000);
      if (jwtPayload.exp && jwtPayload.exp < currentTimestampSeconds) {
        throw new Error('Token expired');
      }

      // Assert email verification (PocketBase users collection does not have a role column)
      const userEmail = String(model.email || '').toLowerCase();
      const adminEmails = ["vkarms.vk@gmail.com"];
      const isAdmin = adminEmails.includes(userEmail);
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

    } catch (error) {
      console.error('Middleware auth verification failed:', error);
      // Clean up corrupt cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('pb_auth');
      return response;
    }
  }

  // If visiting /login or root / and already logged in with admin role, redirect to dashboard
  if (pathname === '/login' || pathname === '/') {
    if (cookieValue) {
      try {
        const decodedCookie = decodeURIComponent(cookieValue);
        const authData = JSON.parse(decodedCookie);
        const model = authData.model;
        const userEmail = String(model?.email || '').toLowerCase();
        const adminEmails = ["vkarms.vk@gmail.com"];
        if (model && adminEmails.includes(userEmail)) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch {
        // Ignore and serve page normally
      }
    }
  }

  return NextResponse.next();
}

// Apply middleware only to relevant routes for performance
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
};
