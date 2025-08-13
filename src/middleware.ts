import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from './lib/session';

export async function middleware(request: NextRequest) {
  const session = await getSession();

  const { pathname } = request.nextUrl;

  // If user is logged in and tries to access login page, redirect to dashboard
  if (session.isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in and tries to access a protected page, redirect to login
  if (!session.isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
