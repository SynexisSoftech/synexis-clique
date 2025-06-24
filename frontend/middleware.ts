// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// The function MUST be named `middleware` and it MUST be exported.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We are only interested in protecting the /admin routes
  if (pathname.startsWith('/admin')) {
    // Check for the existence of your refresh token cookie.
    const refreshTokenCookie = request.cookies.get('refreshToken');

    // If the cookie does not exist, redirect to the login page
    if (!refreshTokenCookie) {
      console.log('[Middleware] No refresh token found, redirecting to login...');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Enhanced security: Validate admin role server-side
    try {
      // First, try to get a fresh access token using the refresh token
      const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.accessToken;

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Now validate the user's role using the access token
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to validate user');
      }

      const userData = await userResponse.json();
      
      // Check if user has admin role
      if (userData.user?.role !== 'admin') {
        console.log('[Middleware] User is not admin, redirecting to login...');
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }

      console.log('[Middleware] Admin access verified for user:', userData.user.email);
    } catch (error) {
      console.error('[Middleware] Error validating admin access:', error);
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
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