import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get current timestamp for logging
  const now = new Date().toISOString();
  const token = request.headers.get('authorization');

  console.log(`[${now}][Middleware] Accessing ${pathname} with token: ${token ?? 'No token provided'}`);

  if (pathname === '/api/secure-data') {
    if (!token || token !== 'Bearer mysecrettoken') {
      console.log(`[${now}][Middleware] Unauthorized access attempt to ${pathname}`);
      // Redirect to /unauthorized
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware only to /api/secure-data
export const config = {
  matcher: '/api/secure-data',
};
