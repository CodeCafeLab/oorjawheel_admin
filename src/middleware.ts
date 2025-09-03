import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const publicPaths = [
  '/login', 
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/assets',
  '/images',
  '/test-login',
  '/super-login'
];

// Define admin paths that require admin role
const adminPaths = ['/users', '/settings'];

// Define API paths that require admin access
const adminApiPaths = ['/api/admin'];

// Define paths that are only for non-authenticated users
const guestPaths = ['/login', '/register'];

interface UserData {
  id: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the auth token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // Handle API routes
  if (pathname.startsWith('/api')) {
    // Allow API auth endpoints
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }
    
    // Require token for other API endpoints
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // For admin API routes, verify user role
    if (adminApiPaths.some(path => pathname.startsWith(path))) {
      const userData = request.cookies.get('user_data')?.value;
      if (userData) {
        try {
          const user: UserData = JSON.parse(userData);
          if (user.role !== 'admin' && user.role !== 'super_admin') {
            return NextResponse.json(
              { error: 'Forbidden' },
              { status: 403 }
            );
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          return NextResponse.json(
            { error: 'Invalid user data' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'User data not found' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.next();
  }

  // Handle page routes
  if (!token) {
    // Redirect to login if trying to access protected route
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect away from auth pages if already logged in
  if (token && guestPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check admin routes
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

  if (isAdminPath) {
    // Get user data from cookie for admin routes
    const userData = request.cookies.get('user_data')?.value;
    
    if (userData) {
      try {
        const user: UserData = JSON.parse(userData);
        // Check if user has admin role
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          // Redirect non-admin users to home
          return NextResponse.redirect(new URL('/', request.url));
        }
        // Allow access for admin users
        return NextResponse.next();
      } catch (error) {
        console.error('Error parsing user data:', error);
        // If there's an error, log out the user
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        response.cookies.delete('user_data');
        return response;
      }
    }
    
    // If no valid user data or not admin, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('user_data');
    return response;
  }
  
  // For all other authenticated routes, allow access
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
