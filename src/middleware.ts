import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticated } from './actions/auth';

// Define public paths that don't require authentication
const publicPaths = ['/login', '/api/auth'];

// Define admin paths that require admin role
const adminPaths = ['/', '/users', '/settings'];

// Define API paths that require admin access
const adminApiPaths = ['/api/admin'];

// Define paths that are only for non-authenticated users (like login, register)
const guestPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths (like static files, images, etc.)
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the auth token from cookies
  const token = request.cookies.get('auth_token')?.value;
  const userData = request.cookies.get('user_data')?.value;
  
  // If no token and trying to access protected route, redirect to login
  if (!token && !publicPaths.some(path => pathname.startsWith(path))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated but tries to access guest-only pages
  if (token && guestPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check admin routes
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path)) || 
                     adminApiPaths.some(path => pathname.startsWith(path));

  if (isAdminPath) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Get user data from cookie
      if (!userData) {
        throw new Error('No user data found');
      }

      const user = JSON.parse(userData);
      
      // Check if user has admin role
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        // If API request, return 403
        if (pathname.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ success: false, message: 'Access denied' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
        // Otherwise redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Error in admin middleware:', error);
      // If there's an error, log out the user
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      response.cookies.delete('user_data');
      return response;
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    '/api/admin/:path*',
  ],
};
