import { NextRequest, NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/me'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute) {
    const accessToken = request.cookies.get('accessToken');

    // If no token on protected route, redirect to login
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is on login page and has valid token, redirect to dashboard
  if (pathname === '/login') {
    const accessToken = request.cookies.get('accessToken');
    if (accessToken) {
      return NextResponse.redirect(new URL('/me', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/me/:path*',
    '/login',
  ],
};
