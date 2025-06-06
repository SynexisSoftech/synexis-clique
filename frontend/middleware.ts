// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// The function MUST be named `middleware` and it MUST be exported.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We are only interested in protecting the /admin routes
  if (pathname.startsWith('/admin')) {
    // Check for the existence of your refresh token cookie.
    // **IMPORTANT**: Make sure 'refreshToken' is the actual name of the cookie your backend sets.
    const refreshTokenCookie = request.cookies.get('refreshToken');

    // If the cookie does not exist, redirect to the login page
    if (!refreshTokenCookie) {
      console.log('[Middleware] No token found, redirecting to login...');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname); // Optional: redirect back after login
      return NextResponse.redirect(loginUrl);
    }
  }

  // If all checks pass, or if the route is not protected, continue.
  return NextResponse.next();
}

// The config object tells Next.js which routes to run the middleware on.
export const config = {
  // Match all paths under /admin, but not API routes or static files.
  matcher: '/admin/:path*',
};